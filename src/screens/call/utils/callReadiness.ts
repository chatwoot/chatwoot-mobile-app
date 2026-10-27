import { Platform } from 'react-native';
import { PERMISSIONS, requestMultiple } from 'react-native-permissions';

import { store } from '@/store';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import { isVoiceCallEnabled } from '@/utils/inboxUtils';

const callPermissions = () => {
  if (Platform.OS === 'ios') return [PERMISSIONS.IOS.MICROPHONE];
  if (Number(Platform.Version) >= 31) {
    return [PERMISSIONS.ANDROID.RECORD_AUDIO, PERMISSIONS.ANDROID.BLUETOOTH_CONNECT];
  }
  return [PERMISSIONS.ANDROID.RECORD_AUDIO];
};

export const runCallReadiness = async () => {
  const inboxes = selectAllInboxes(store.getState());
  if (!inboxes.some(isVoiceCallEnabled)) return;

  await requestMultiple(callPermissions());
};
