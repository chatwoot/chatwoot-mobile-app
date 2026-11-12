import { useEffect } from 'react';
import { AppState } from 'react-native';

import { flushMicrophonePrompt } from '@/utils/voiceCallFeedback';

export const useMicrophonePrompt = () => {
  useEffect(() => {
    flushMicrophonePrompt().catch(() => {});
    const subscription = AppState.addEventListener('change', next => {
      if (next === 'active') flushMicrophonePrompt().catch(() => {});
    });
    return () => subscription.remove();
  }, []);
};
