import { Platform } from 'react-native';
import InCallManager from 'react-native-incall-manager';
import { MediaStream, mediaDevices, RTCPeerConnection } from 'react-native-webrtc';

import { hasNativeAudioRouting, startAppCallAudio, stopAppCallAudio } from '../chatwootCalls';
import { webrtcEngine } from '../webrtcEngine';

jest.mock('../chatwootCalls', () => ({
  hasNativeAudioRouting: jest.fn(() => true),
  startAppCallAudio: jest.fn(),
  stopAppCallAudio: jest.fn(),
  setSpeakerOn: jest.fn(),
}));

const originalOS = Platform.OS;
beforeEach(() => {
  Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
  jest.clearAllMocks();
  (hasNativeAudioRouting as jest.Mock).mockReturnValue(true);
  (startAppCallAudio as jest.Mock).mockReturnValue('audio-1');
});
afterEach(async () => {
  await webrtcEngine.hangup();
  jest.restoreAllMocks();
  Object.defineProperty(Platform, 'OS', { value: originalOS, configurable: true });
});

test('native audio owns a WhatsApp session and releases it on hangup', async () => {
  await webrtcEngine.createOffer();
  expect(startAppCallAudio).toHaveBeenCalledTimes(1);
  expect(InCallManager.start).not.toHaveBeenCalled();
  webrtcEngine.ensureAudioRoute(true);
  expect(InCallManager.setForceSpeakerphoneOn).not.toHaveBeenCalled();
  await webrtcEngine.hangup();
  expect(stopAppCallAudio).toHaveBeenCalledWith('audio-1');
  expect(InCallManager.stop).not.toHaveBeenCalled();
});

test('an SDP failure releases the native audio session before the call is connected', async () => {
  jest
    .spyOn(RTCPeerConnection.prototype, 'setRemoteDescription')
    .mockRejectedValueOnce(new Error('bad SDP'));
  await expect(webrtcEngine.createAnswer('bad')).rejects.toThrow('bad SDP');
  expect(stopAppCallAudio).toHaveBeenCalledWith('audio-1');
});

test('cancelling a pending microphone request releases native routing immediately', async () => {
  let resolveMedia!: (stream: MediaStream) => void;
  (mediaDevices.getUserMedia as jest.Mock).mockImplementationOnce(
    () =>
      new Promise(resolve => {
        resolveMedia = resolve;
      }),
  );
  const offer = webrtcEngine.createOffer();
  while (!resolveMedia) await Promise.resolve();
  await webrtcEngine.hangup();
  expect(stopAppCallAudio).toHaveBeenCalledWith('audio-1');
  resolveMedia(new MediaStream());
  await expect(offer).rejects.toThrow('Superseded');
  expect(startAppCallAudio).toHaveBeenCalledTimes(1);
});

test('a late failure from an old offer cannot release the next call audio', async () => {
  let rejectOffer!: (error: Error) => void;
  jest.spyOn(RTCPeerConnection.prototype, 'createOffer').mockImplementationOnce(
    () =>
      new Promise((_, reject) => {
        rejectOffer = reject;
      }),
  );
  const old = webrtcEngine.createOffer().catch(error => error);
  while (!rejectOffer) await Promise.resolve();
  await webrtcEngine.hangup();
  (startAppCallAudio as jest.Mock).mockReturnValue('audio-2');
  await webrtcEngine.createOffer();
  rejectOffer(new Error('old SDP failure'));
  await old;
  expect(stopAppCallAudio).toHaveBeenCalledTimes(1);
  expect(stopAppCallAudio).toHaveBeenLastCalledWith('audio-1');
  await webrtcEngine.hangup();
  expect(stopAppCallAudio).toHaveBeenLastCalledWith('audio-2');
});

test('Telecom media does not create or release an app audio session', async () => {
  (startAppCallAudio as jest.Mock).mockReturnValue(null);
  await webrtcEngine.createOffer();
  await webrtcEngine.hangup();
  expect(stopAppCallAudio).not.toHaveBeenCalled();
  expect(InCallManager.start).not.toHaveBeenCalled();
});
