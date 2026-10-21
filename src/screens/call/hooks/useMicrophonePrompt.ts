import { useEffect } from 'react';
import { AppState } from 'react-native';

import { flushMicrophonePrompt } from '@/utils/voiceCallFeedback';

// A call answered on the lock screen can fail because the microphone is off for the app,
// where no dialog can be shown. The reason is raised on the way back into the app.
export const useMicrophonePrompt = () => {
  useEffect(() => {
    flushMicrophonePrompt().catch(() => {});
    const subscription = AppState.addEventListener('change', next => {
      if (next === 'active') flushMicrophonePrompt().catch(() => {});
    });
    return () => subscription.remove();
  }, []);
};
