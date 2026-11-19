import i18n from '@/i18n';
import type { LiveCall } from '@/store/call/callTypes';
import { callTimerStart } from '@/utils/voiceCallUtils';

import { callStatusText } from '../callStatusText';

const placed = (extra: Partial<LiveCall> = {}): LiveCall => ({
  callSid: 'CA1',
  provider: 'twilio',
  callDirection: 'outbound',
  isActive: true,
  addedAt: 1,
  activeSince: 1000,
  ...extra,
});

describe('callStatusText', () => {
  it('shows ringing on a placed Twilio call until the contact answers', () => {
    const call = placed({ providerStatus: 'ringing' });
    expect(callStatusText(call, '00:05', { isConnected: true })).toBe(
      i18n.t('CONVERSATION.VOICE_WIDGET.RINGING'),
    );
    expect(callStatusText(placed(), '00:05', { isConnected: true })).toBe(
      i18n.t('CONVERSATION.VOICE_WIDGET.CALLING'),
    );
    expect(callTimerStart(call, call.activeSince)).toBeUndefined();
  });

  it('shows the timer from the answer once the contact picks up', () => {
    const call = placed({ providerStatus: 'in-progress', answeredAt: 5000 });
    expect(callStatusText(call, '00:05', { isConnected: true })).toBe('00:05');
    expect(callTimerStart(call, call.activeSince)).toBe(5000);
  });

  it('times other calls from when this device joined', () => {
    const inbound = placed({ callDirection: 'inbound' });
    const whatsapp = placed({ provider: 'whatsapp' });
    expect(callStatusText(inbound, '00:05', { isConnected: true })).toBe('00:05');
    expect(callTimerStart(inbound, 1000)).toBe(1000);
    expect(callTimerStart(whatsapp, 1000)).toBe(1000);
  });
});
