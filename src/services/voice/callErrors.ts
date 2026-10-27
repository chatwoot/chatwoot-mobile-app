import type { VoiceCallProvider } from '@/types';

export class MediaUnavailableError extends Error {
  constructor(provider: VoiceCallProvider) {
    super(`No media engine for ${provider}`);
    this.name = 'MediaUnavailableError';
  }
}

export class MicrophoneDeniedError extends Error {
  constructor() {
    super('Microphone permission denied');
    this.name = 'MicrophoneDeniedError';
  }
}

// Thunks serialize errors without class identity.
const isErrorNamed = (error: unknown, name: string) =>
  typeof error === 'object' && error !== null && (error as { name?: string }).name === name;

export const isMediaUnavailableError = (error: unknown) =>
  isErrorNamed(error, 'MediaUnavailableError');

export const isMicrophoneDeniedError = (error: unknown) =>
  isErrorNamed(error, 'MicrophoneDeniedError');
