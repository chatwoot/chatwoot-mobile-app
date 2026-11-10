import { Platform } from 'react-native';
import { PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import type { MediaStream, RTCPeerConnection } from 'react-native-webrtc';

import {
  hasNativeAudioRouting,
  startAppCallAudio,
  stopAppCallAudio,
  setSpeakerOn as nativeSetSpeakerOn,
} from '@/services/voice/chatwootCalls';
import { MicrophoneDeniedError } from '@/services/voice/callErrors';

import type { IceServer } from '@/store/call/callTypes';

// Imports initialize native audio machinery.
const webrtc = () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('react-native-webrtc') as typeof import('react-native-webrtc');
const inCallManager = () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  (require('react-native-incall-manager') as typeof import('react-native-incall-manager')).default;

// Native routing excludes InCallManager ownership.
const usesInCallManager = () => Platform.OS === 'android' && !hasNativeAudioRouting();

// Meta does not support trickle ICE.
const ICE_GATHER_TIMEOUT_MS = 6_000;
const ICE_GATHER_EARLY_EXIT_MS = 1_500;
// Disconnections may never transition to failed.
const CONNECTION_LOST_GRACE_MS = 4_000;
const LOST_STATES: string[] = ['disconnected', 'failed', 'closed'];
const DEFAULT_ICE_SERVERS: IceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];

type Session = {
  pc: RTCPeerConnection;
  localStream: MediaStream;
  remoteStreams: MediaStream[];
  muted: boolean;
  held: boolean;
  audioToken: string | null;
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
let pendingMuted = false;

let onConnectionLost: (() => void) | null = null;

export const setWebrtcConnectionLostHandler = (handler: (() => void) | null) => {
  onConnectionLost = handler;
};

let onMicrophoneGranted: (() => void) | null = null;

export const setMicrophoneGrantedHandler = (handler: (() => void) | null) => {
  onMicrophoneGranted = handler;
};

export const ensureMicrophonePermission = async () => {
  const microphone =
    Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO;
  const status = await request(microphone);
  if (status !== RESULTS.GRANTED) throw new MicrophoneDeniedError();
  onMicrophoneGranted?.();
  // Bluetooth denial leaves phone routes available.
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

const teardown = (only?: Session) => {
  if (!session || (only && session !== only)) return;
  const current = session;
  session = null;
  try {
    release(current);
  } finally {
    if (current.audioToken) stopAppCallAudio(current.audioToken);
    if (Platform.OS === 'ios') inCallManager().setForceSpeakerphoneOn(false);
    if (usesInCallManager()) {
      inCallManager().setForceSpeakerphoneOn(false);
      inCallManager().stop();
    }
  }
};

let opening = 0;
let openingAudioToken: string | null = null;
const releaseOpeningAudio = () => {
  if (openingAudioToken) stopAppCallAudio(openingAudioToken);
  openingAudioToken = null;
};
const abandonOpening = () => {
  opening += 1;
  pendingMuted = false;
  releaseOpeningAudio();
};

const openSession = async (iceServers?: IceServer[]): Promise<Session> => {
  opening += 1;
  const attempt = opening;
  pendingMuted = false;
  teardown();
  releaseOpeningAudio();
  await ensureMicrophonePermission();
  if (attempt !== opening) throw new Error('Superseded by a newer call');
  // WebRTC mutates supplied ICE server objects.
  const servers = (iceServers?.length ? iceServers : DEFAULT_ICE_SERVERS).map(server => ({
    ...server,
  }));
  const pc = new (webrtc().RTCPeerConnection)({ iceServers: servers });
  const audioToken = Platform.OS === 'android' ? startAppCallAudio() : null;
  openingAudioToken = audioToken;
  let localStream: MediaStream | undefined;
  try {
    const stream = await webrtc().mediaDevices.getUserMedia({ audio: true, video: false });
    localStream = stream;
    if (attempt !== opening) throw new Error('Superseded by a newer call');
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    const next: Session = {
      pc,
      localStream,
      remoteStreams: [],
      muted: pendingMuted,
      held: false,
      audioToken,
    };
    pendingMuted = false;
    applyTrackState(next);
    pc.ontrack = (event: unknown) => {
      const streams = (event as { streams?: MediaStream[] }).streams || [];
      next.remoteStreams.push(...streams);
      applyTrackState(next);
    };
    pc.oniceconnectionstatechange = () => {
      if (__DEV__) console.log(`[call] ice connection: ${pc.iceConnectionState}`);
    };
    // Transient WebRTC failures can recover.
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
      if (!LOST_STATES.includes(state)) return;
      if (lostTimer) return;
      lostTimer = setTimeout(() => {
        lostTimer = null;
        if (session?.pc !== pc) return;
        if (LOST_STATES.includes(pc.connectionState)) onConnectionLost?.();
      }, CONNECTION_LOST_GRACE_MS);
    };
    // Android playback requires communication audio focus.
    if (usesInCallManager()) inCallManager().start({ media: 'audio', auto: false });
    session = next;
    if (openingAudioToken === audioToken) openingAudioToken = null;
    return next;
  } catch (error) {
    if (audioToken) stopAppCallAudio(audioToken);
    if (openingAudioToken === audioToken) openingAudioToken = null;
    localStream?.getTracks().forEach(track => track.stop());
    pc.close();
    throw error;
  }
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
    abandonOpening();
    teardown();
  },

  abandonOpening() {
    abandonOpening();
  },

  async setMuted(muted: boolean) {
    if (!session) {
      pendingMuted = muted;
      return;
    }
    session.muted = muted;
    applyTrackState(session);
  },

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

  // Android can overwrite initial route requests.
  ensureAudioRoute(speakerOn: boolean) {
    if (Platform.OS !== 'android' || hasNativeAudioRouting()) return;
    const forSession = session;
    if (!forSession) return;
    const apply = () => {
      if (session !== forSession) return;
      if (usesInCallManager()) {
        inCallManager().start({ media: 'audio', auto: false });
        inCallManager().setForceSpeakerphoneOn(speakerOn);
      }
      nativeSetSpeakerOn(speakerOn);
    };
    apply();
    setTimeout(apply, 800);
  },

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
