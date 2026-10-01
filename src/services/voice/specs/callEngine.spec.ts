import { callEngine } from '../callEngine';
import { webrtcEngine } from '../webrtcEngine';
import { twilioDisconnect } from '@/services/voice/chatwootCalls';

jest.mock('../webrtcEngine', () => ({
  webrtcEngine: { hangup: jest.fn(() => Promise.resolve()) },
}));

jest.mock('@/services/voice/chatwootCalls', () => ({
  isNativeCallsAvailable: jest.fn(() => true),
  isTelecomAvailable: jest.fn(() => false),
  setAudioRoute: jest.fn(),
  setSpeakerOn: jest.fn(),
  twilioConnect: jest.fn(() => Promise.resolve()),
  twilioDisconnect: jest.fn(),
  twilioSetHold: jest.fn(),
  twilioSetMuted: jest.fn(),
}));

describe('callEngine.hangup', () => {
  beforeEach(() => jest.clearAllMocks());

  it('disconnects the Twilio leg for a Twilio call', async () => {
    await callEngine.hangup('twilio');

    expect(twilioDisconnect).toHaveBeenCalledTimes(1);
    expect(webrtcEngine.hangup).not.toHaveBeenCalled();
  });

  it('closes the WebRTC session for a WhatsApp call', async () => {
    await callEngine.hangup('whatsapp');

    expect(webrtcEngine.hangup).toHaveBeenCalledTimes(1);
    expect(twilioDisconnect).not.toHaveBeenCalled();
  });
});

describe('callEngine.hangup with a session', () => {
  beforeEach(() => jest.clearAllMocks());

  it('leaves a later call alone when the hangup was meant for an earlier one', async () => {
    const earlier = callEngine.session();
    await callEngine.twilio.connect('token', {});

    await callEngine.hangup('twilio', earlier);

    expect(twilioDisconnect).not.toHaveBeenCalled();
  });

  it('ends the media it was taken for', async () => {
    await callEngine.twilio.connect('token', {});
    const current = callEngine.session();

    await callEngine.hangup('twilio', current);

    expect(twilioDisconnect).toHaveBeenCalledTimes(1);
  });
});
