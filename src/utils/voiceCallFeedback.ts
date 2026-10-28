import { Alert, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { openSettings } from 'react-native-permissions';

import i18n from '@/i18n';
import { isMediaUnavailableError, isMicrophoneDeniedError } from '@/services/voice/callErrors';
import { captureVoiceFailure } from '@/services/voice/callTelemetry';
import type { LiveCall } from '@/store/call/callTypes';
import type { VoiceCallProvider } from '@/types';

import { showToast } from './toastUtils';

// Lock-screen failures defer prompts until foreground.
const PENDING_MICROPHONE_PROMPT_KEY = 'callMicrophoneBlocked';

export const toastJoinOutcome = (status?: string) => {
  if (status === 'answered_elsewhere') {
    showToast({ message: i18n.t('CONVERSATION.VOICE_WIDGET.ANSWERED_ELSEWHERE') });
  } else if (status === 'already_ended') {
    showToast({ message: i18n.t('CONVERSATION.VOICE_WIDGET.CALL_ALREADY_ENDED') });
  }
};

const showMicrophoneAlert = () => {
  Alert.alert(
    i18n.t('CONVERSATION.VOICE_WIDGET.MICROPHONE_BLOCKED_TITLE'),
    i18n.t('CONVERSATION.VOICE_WIDGET.MICROPHONE_BLOCKED_BODY'),
    [
      { text: i18n.t('CONVERSATION.VOICE_WIDGET.NOT_NOW'), style: 'cancel' },
      {
        text: i18n.t('CONVERSATION.VOICE_WIDGET.OPEN_SETTINGS'),
        onPress: () => {
          openSettings().catch(() => {});
        },
      },
    ],
    { cancelable: true },
  );
};

export const promptForMicrophone = () => {
  if (AppState.currentState === 'active') {
    showMicrophoneAlert();
    return;
  }
  AsyncStorage.setItem(PENDING_MICROPHONE_PROMPT_KEY, 'yes').catch(() => {});
};

export const flushMicrophonePrompt = async () => {
  if ((await AsyncStorage.getItem(PENDING_MICROPHONE_PROMPT_KEY)) !== 'yes') return;
  await AsyncStorage.removeItem(PENDING_MICROPHONE_PROMPT_KEY);
  showMicrophoneAlert();
};

export const reportAnswerFailure = (
  error: unknown,
  source: string,
  call?: Pick<LiveCall, 'provider' | 'callDirection'>,
) => {
  captureVoiceFailure(error, 'answer', {
    source,
    provider: call?.provider,
    callDirection: call?.callDirection,
  });
  if (isMicrophoneDeniedError(error)) {
    promptForMicrophone();
    return;
  }
  showToast({
    message: i18n.t(
      isMediaUnavailableError(error)
        ? 'CONVERSATION.VOICE_WIDGET.ANSWER_UNAVAILABLE'
        : 'CONVERSATION.VOICE_WIDGET.JOIN_FAILED',
    ),
  });
};

export const reportOutboundFailure = (
  error: unknown,
  messageKey: string,
  provider?: VoiceCallProvider,
) => {
  captureVoiceFailure(error, 'outbound', { provider, callDirection: 'outbound' });
  if (isMicrophoneDeniedError(error)) {
    promptForMicrophone();
    return;
  }
  showToast({
    message: i18n.t(
      isMediaUnavailableError(error) ? 'CONVERSATION.HEADER.CALL_UNAVAILABLE' : messageKey,
    ),
  });
};
