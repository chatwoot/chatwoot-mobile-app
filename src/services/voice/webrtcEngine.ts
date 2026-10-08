import { Platform } from 'react-native';
import { PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import type { MediaStream, RTCPeerConnection } from 'react-native-webrtc';

import {
  isTelecomAvailable,
  setSpeakerOn as nativeSetSpeakerOn,
} from '@/services/voice/chatwootCalls';
import { MicrophoneDeniedError } from '@/services/voice/callEngine';

import type { IceServer } from '@/store/call/callTypes';

// The WebRTC and in-call audio modules start native audio machinery when first loaded, so
// they are loaded with the first call rather than with the app
const webrtc = () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('react-native-webrtc') as typeof import('react-native-webrtc');
const inCallManager = () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  (require('react-native-incall-manager') as typeof import('react-native-incall-manager')).default;

// With Telecom tracking the call, the in-call manager's device selection would override
// the route the system chose, a Bluetooth headset first of all
const usesInCallManager = () => Platform.OS === 'android' && !isTelecomAvailable();

// Meta's calling API exchanges one SDP each way with no trickle ICE, so the local
// description must carry its candidates before it is sent. The caller is still ringing
// while this runs, so the wait ends as soon as gathering finishes, or once a reflexive
// candidate has arrived and a short grace period has passed. The cap is the long stop.
const ICE_GATHER_TIMEOUT_MS = 6_000;
const ICE_GATHER_EARLY_EXIT_MS = 1_500;
// How long a dead connection has to stay dead before the call is given up on
const CONNECTION_LOST_GRACE_MS = 4_000;
const DEFAULT_ICE_SERVERS: IceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];

type Session = {
  pc: RTCPeerConnection;
  localStream: MediaStream;
  remoteStreams: MediaStream[];
  // Mute and hold are separate choices; the microphone is live only with neither set
  muted: boolean;
  held: boolean;
};

const applyTrackState = (current: Session) => {
  current.localStream.getAudioTracks().forEach(track => {
    track.enabled = !current.muted && !current.held;
  });
  current.remoteStreams.forEach(stream =>
    stream.getAudioTracks().forEach(track => {
      track.enabled = !current.held;
    }),
  );
};

let session: Session | null = null;

// Told when the peer connection drops, so the call screen can close without waiting for
// the server to say the call ended
let onConnectionLost: (() => void) | null = null;

export const setWebrtcConnectionLostHandler = (handler: (() => void) | null) => {
  onConnectionLost = handler;
};

// Asks where the agent has not decided yet, and reports a refusal the call screen can
// explain. Where the permission was granted at login this returns at once.
const ensureMicrophonePermission = async () => {
  const microphone =
    Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO;
  const status = await request(microphone);
  if (status !== RESULTS.GRANTED) throw new MicrophoneDeniedError();
  // Telecom needs this to offer Bluetooth headsets as a route; a refusal only loses that
  if (Platform.OS === 'android' && Number(Platform.Version) >= 31) {
    await request(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT).catch(() => {});
  }
};

const waitForIceGatheringComplete = (pc: RTCPeerConnection) =>
  new Promise<void>(resolve => {
    if (pc.iceGatheringState === 'complete') {
      resolve();
      return;
    }
    let hasReflexive = false;
    const finish = () => {
      clearTimeout(timer);
      clearTimeout(earlyTimer);
      pc.onicegatheringstatechange = null;
      pc.onicecandidate = null;
      resolve();
    };
    const timer = setTimeout(finish, ICE_GATHER_TIMEOUT_MS);
    // Enough to connect through a typical network; the rest can arrive after the answer
    const earlyTimer = setTimeout(() => {
      if (hasReflexive) finish();
    }, ICE_GATHER_EARLY_EXIT_MS);
    pc.onicecandidate = (event: unknown) => {
      const candidate = (event as { candidate?: { candidate?: string } }).candidate?.candidate;
      if (candidate && (candidate.includes('typ srflx') || candidate.includes('typ relay'))) {
        hasReflexive = true;
      }
    };
    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === 'complete') finish();
    };
  });

const release = ({ pc, localStream }: Pick<Session, 'pc' | 'localStream'>) => {
  localStream.getTracks().forEach(track => track.stop());
  pc.close();
};

// Ends the current session, or only `only` when given, so a call's cleanup never ends the
// session of a call started after it
const teardown = (only?: Session) => {
  if (!session || (only && session !== only)) return;
  const current = session;
  session = null;
  try {
    release(current);
  } finally {
    if (Platform.OS === 'ios') inCallManager().setForceSpeakerphoneOn(false);
    if (usesInCallManager()) {
      inCallManager().setForceSpeakerphoneOn(false);
      inCallManager().stop();
    }
  }
};

// Counts session opens; an open overtaken by a newer one while it waited is abandoned
let opening = 0;

const openSession = async (iceServers?: IceServer[]): Promise<Session> => {
  opening += 1;
  const attempt = opening;
  teardown();
  await ensureMicrophonePermission();
  // The library strips the urls key off each server it is given, so it must never see
  // the frozen store objects or the shared default
  const servers = (iceServers?.length ? iceServers : DEFAULT_ICE_SERVERS).map(server => ({
    ...server,
  }));
  const pc = new (webrtc().RTCPeerConnection)({ iceServers: servers });
  const localStream = await webrtc().mediaDevices.getUserMedia({ audio: true, video: false });
  if (attempt !== opening) {
    release({ pc, localStream });
    throw new Error('Superseded by a newer call');
  }
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  const next: Session = { pc, localStream, remoteStreams: [], muted: false, held: false };
  // Remote audio plays through the active audio session as soon as the track arrives,
  // unless the call is on hold
  pc.ontrack = (event: unknown) => {
    const streams = (event as { streams?: MediaStream[] }).streams || [];
    next.remoteStreams.push(...streams);
    applyTrackState(next);
  };
  pc.oniceconnectionstatechange = () => {
    if (__DEV__) console.log(`[call] ice connection: ${pc.iceConnectionState}`);
  };
  // A call is only treated as lost once the connection has stayed down: WebRTC passes
  // through 'failed' while it retries, and dropping the call on the first blip would end
  // calls that were about to recover.
  let lostTimer: ReturnType<typeof setTimeout> | null = null;
  pc.onconnectionstatechange = () => {
    if (__DEV__) console.log(`[call] connection: ${pc.connectionState}`);
    if (session?.pc !== pc) return;
    const state = pc.connectionState;
    if (state === 'connected' || state === 'connecting') {
      if (lostTimer) clearTimeout(lostTimer);
      lostTimer = null;
      return;
    }
    if (state !== 'failed' && state !== 'closed') return;
    if (lostTimer) return;
    lostTimer = setTimeout(() => {
      lostTimer = null;
      if (session?.pc !== pc) return;
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') onConnectionLost?.();
    }, CONNECTION_LOST_GRACE_MS);
  };
  // iOS leaves the audio session to WebRTC and CallKit. Android needs to be put into
  // communication mode and hold audio focus, or the remote audio is never heard even
  // though the microphone works.
  if (usesInCallManager()) inCallManager().start({ media: 'audio', auto: false });
  session = next;
  return next;
};

const localSdp = (pc: RTCPeerConnection) => {
  const sdp = pc.localDescription?.sdp;
  if (!sdp) throw new Error('No local description');
  return sdp;
};

export const webrtcEngine = {
  async createAnswer(sdpOffer: string, iceServers?: IceServer[]) {
    const opened = await openSession(iceServers);
    const { pc } = opened;
    try {
      await pc.setRemoteDescription(
        new (webrtc().RTCSessionDescription)({ type: 'offer', sdp: sdpOffer }),
      );
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await waitForIceGatheringComplete(pc);
      return localSdp(pc);
    } catch (error) {
      teardown(opened);
      throw error;
    }
  },

  async createOffer(iceServers?: IceServer[]) {
    const opened = await openSession(iceServers);
    const { pc } = opened;
    try {
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
      await pc.setLocalDescription(offer);
      await waitForIceGatheringComplete(pc);
      return localSdp(pc);
    } catch (error) {
      teardown(opened);
      throw error;
    }
  },

  async applyAnswer(sdpAnswer: string) {
    if (!session) throw new Error('No call in progress');
    await session.pc.setRemoteDescription(
      new (webrtc().RTCSessionDescription)({ type: 'answer', sdp: sdpAnswer }),
    );
  },

  async hangup() {
    teardown();
  },

  async setMuted(muted: boolean) {
    if (!session) return;
    session.muted = muted;
    applyTrackState(session);
  },

  // Held: nothing is sent and nothing is played, until the call is taken back. Unmuting
  // while held keeps the microphone off.
  async setHold(hold: boolean) {
    if (!session) return;
    session.held = hold;
    applyTrackState(session);
  },

  async setSpeaker(enabled: boolean) {
    if (Platform.OS === 'android') nativeSetSpeakerOn(enabled);
    if (Platform.OS === 'ios' || usesInCallManager())
      inCallManager().setForceSpeakerphoneOn(enabled);
  },

  // Android occasionally starts a call with the route still on the previous one, which
  // sounds like a dead line. Re-asserting it when the call goes live, and once more a
  // moment later, covers the race with the system taking the route back.
  ensureAudioRoute(speakerOn: boolean) {
    if (Platform.OS !== 'android') return;
    const apply = () => {
      if (usesInCallManager()) {
        inCallManager().start({ media: 'audio', auto: false });
        inCallManager().setForceSpeakerphoneOn(speakerOn);
      }
      nativeSetSpeakerOn(speakerOn);
    };
    apply();
    setTimeout(apply, 800);
  },

  // Selected candidate pair and audio byte counters, for diagnosing a silent call
  async connectionReport() {
    if (!session) return null;
    const stats = await session.pc.getStats();
    const report: Record<string, unknown> = {
      ice: session.pc.iceConnectionState,
      connection: session.pc.connectionState,
    };
    stats.forEach((entry: Record<string, unknown>) => {
      if (entry.type === 'candidate-pair' && (entry.selected || entry.nominated)) {
        report.pair = {
          state: entry.state,
          local: entry.localCandidateId,
          remote: entry.remoteCandidateId,
        };
      }
      if (entry.type === 'local-candidate' || entry.type === 'remote-candidate') {
        report[`${entry.type}:${entry.id}`] =
          `${entry.candidateType} ${entry.protocol} ${entry.address ?? entry.ip}:${entry.port}`;
      }
      if (entry.type === 'inbound-rtp' && entry.kind === 'audio') {
        report.inboundBytes = entry.bytesReceived;
      }
      if (entry.type === 'outbound-rtp' && entry.kind === 'audio') {
        report.outboundBytes = entry.bytesSent;
      }
    });
    return report;
  },
};
