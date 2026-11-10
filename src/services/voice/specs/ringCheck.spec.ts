import { CallService } from '@/store/call/callService';
import { isStillRinging } from '../ringCheck';

jest.mock('@/store/call/callService', () => ({
  CallService: { getWhatsappCall: jest.fn(), getRingingCalls: jest.fn() },
}));

const recent = () => Date.now() / 1000 - 5;

beforeEach(() => jest.clearAllMocks());

test('a WhatsApp call the server has ended is not ringing, however fresh its bubble', async () => {
  (CallService.getWhatsappCall as jest.Mock).mockResolvedValue({ status: 'completed' });

  await expect(
    isStillRinging({ callSid: 'wa', callId: 5, provider: 'whatsapp', createdAt: recent() }),
  ).resolves.toBe(false);
});

test('a WhatsApp bubble past its ring window is not ringing, without asking the server', async () => {
  await expect(
    isStillRinging({
      callSid: 'wa',
      callId: 5,
      provider: 'whatsapp',
      createdAt: Date.now() / 1000 - 3600,
    }),
  ).resolves.toBe(false);
  expect(CallService.getWhatsappCall).not.toHaveBeenCalled();
});

test('a Twilio caller is ringing only while the server lists the call', async () => {
  (CallService.getRingingCalls as jest.Mock).mockResolvedValue([{ id: 1, call_id: 'CA-live' }]);

  await expect(
    isStillRinging({ callSid: 'CA-live', provider: 'twilio', createdAt: 0 }),
  ).resolves.toBe(true);
  await expect(
    isStillRinging({ callSid: 'CA-gone', provider: 'twilio', createdAt: 0 }),
  ).resolves.toBe(false);
});

test('a check that cannot be made leaves the decision to the join', async () => {
  (CallService.getRingingCalls as jest.Mock).mockRejectedValue(new Error('offline'));

  await expect(isStillRinging({ callSid: 'CA', provider: 'twilio', createdAt: 0 })).resolves.toBe(
    true,
  );
});

test('a call the server no longer has is not ringing', async () => {
  (CallService.getWhatsappCall as jest.Mock).mockRejectedValue({ response: { status: 404 } });

  await expect(
    isStillRinging({ callSid: 'wa', callId: 5, provider: 'whatsapp', createdAt: recent() }),
  ).resolves.toBe(false);
});
