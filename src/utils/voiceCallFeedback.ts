import { Alert, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { openSettings } from 'react-native-permissions';

import i18n from '@/i18n';
import { isMediaUnavailableError, isMicrophoneDeniedError } from '@/services/voice/callEngine';

import { showToast } from './toastUtils';

// A call answered on a lock screen fails where nothing can be shown, so the reason waits
// here until the agent opens the app
const PENDING_MICROPHONE_PROMPT_KEY = 'callMicrophoneBlocked';

// Tells the agent how an answer that did not join played out
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

// A call cannot carry audio without the microphone, and only the agent can give it back
export const promptForMicrophone = () => {
  if (AppState.currentState === 'active') {
    showMicrophoneAlert();
    return;
  }
  AsyncStorage.setItem(PENDING_MICROPHONE_PROMPT_KEY, 'yes').catch(() => {});
};

// Raises a prompt held back while the app was away
export const flushMicrophonePrompt = async () => {
  if ((await AsyncStorage.getItem(PENDING_MICROPHONE_PROMPT_KEY)) !== 'yes') return;
  await AsyncStorage.removeItem(PENDING_MICROPHONE_PROMPT_KEY);
  showMicrophoneAlert();
};

// Why an answer failed: the microphone is off, the media engine is unavailable, or the
// request itself did not go through
export const reportAnswerFailure = (error: unknown) => {
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

// Why a call the agent placed did not start
export const reportOutboundFailure = (error: unknown, messageKey: string) => {
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
