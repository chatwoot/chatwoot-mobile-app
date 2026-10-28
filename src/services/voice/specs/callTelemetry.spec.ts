import * as Sentry from '@sentry/react-native';
import { AxiosError } from 'axios';

import { MicrophoneDeniedError } from '../callErrors';
import { captureVoiceFailure } from '../callTelemetry';

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

const captureException = Sentry.captureException as jest.Mock;

describe('captureVoiceFailure', () => {
  beforeEach(() => captureException.mockClear());

  it('reports a failed answer with its stage, source and provider', () => {
    const error = new Error('Join failed');
    captureVoiceFailure(error, 'answer', {
      source: 'call_screen',
      provider: 'twilio',
      callDirection: 'inbound',
    });
    expect(captureException).toHaveBeenCalledWith(error, {
      tags: { 'voice.stage': 'answer', 'voice.source': 'call_screen', 'voice.provider': 'twilio' },
      contexts: {
        voice: {
          stage: 'answer',
          source: 'call_screen',
          provider: 'twilio',
          callDirection: 'inbound',
        },
      },
    });
  });

  it('rebuilds a serialized thunk error as an Error and tags its code', () => {
    captureVoiceFailure(
      {
        name: 'AxiosError',
        message: 'Request failed with status code 422',
        code: 'ERR_BAD_REQUEST',
      },
      'outbound',
    );
    const [reported, hint] = captureException.mock.calls[0];
    expect(reported).toBeInstanceOf(Error);
    expect(reported.name).toBe('AxiosError');
    expect(reported.message).toBe('Request failed with status code 422');
    expect(hint.tags['voice.error_code']).toBe('ERR_BAD_REQUEST');
  });

  it('skips a denied microphone, raw or serialized', () => {
    captureVoiceFailure(new MicrophoneDeniedError(), 'answer');
    captureVoiceFailure({ name: 'MicrophoneDeniedError', message: 'denied' }, 'outbound');
    expect(captureException).not.toHaveBeenCalled();
  });

  it('skips requests that never reached the server, raw or serialized', () => {
    captureVoiceFailure(new AxiosError('Network Error'), 'voip_token');
    captureVoiceFailure(
      { name: 'AxiosError', message: 'Network Error', code: 'ERR_NETWORK' },
      'answer',
    );
    captureVoiceFailure({ name: 'AxiosError', message: 'timeout', code: 'ECONNABORTED' }, 'answer');
    expect(captureException).not.toHaveBeenCalled();
  });
});
