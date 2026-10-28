import * as Sentry from '@sentry/react-native';

import type { LiveCall } from '@/store/call/callTypes';
import { isTransportError } from '@/utils/sentryUtils';

import { isMicrophoneDeniedError } from './callErrors';

export type VoiceFailureStage =
  | 'answer'
  | 'outbound'
  | 'system_ui_incoming'
  | 'system_ui_outgoing'
  | 'voip_token';

type ErrorLike = { name?: string; message?: string; code?: string; stack?: string };

type CallContext = Partial<Pick<LiveCall, 'provider' | 'callDirection'>> & { source?: string };

// Axios codes for requests that never reached the server.
const TRANSPORT_CODES = ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT', 'ERR_CANCELED'];

const asErrorLike = (error: unknown): ErrorLike =>
  typeof error === 'object' && error !== null ? (error as ErrorLike) : { message: String(error) };

// Thunks reject with a plain serialized object; the axios code survives serialization.
const isTransportFailure = (error: unknown) => {
  const code = asErrorLike(error).code;
  return isTransportError(error) || (!!code && TRANSPORT_CODES.includes(code));
};

const toError = (error: unknown) => {
  if (error instanceof Error) return error;
  const { name, message, stack } = asErrorLike(error);
  const normalized = new Error(message || 'Voice call failed');
  if (name) normalized.name = name;
  if (stack) normalized.stack = stack;
  return normalized;
};

/**
 * Reports a voice call failure the user experiences as a call that would not
 * ring, answer or start. Denied microphone access and requests that never
 * reached the server track the device, not the app, and are skipped.
 */
export const captureVoiceFailure = (
  error: unknown,
  stage: VoiceFailureStage,
  { source, provider, callDirection }: CallContext = {},
) => {
  if (isMicrophoneDeniedError(error) || isTransportFailure(error)) return;
  const code = asErrorLike(error).code;
  Sentry.captureException(toError(error), {
    tags: {
      'voice.stage': stage,
      ...(source && { 'voice.source': source }),
      ...(provider && { 'voice.provider': provider }),
      ...(code && { 'voice.error_code': code }),
    },
    contexts: { voice: { stage, source, provider, callDirection } },
  });
};
