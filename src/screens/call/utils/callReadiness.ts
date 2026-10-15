import { Platform } from 'react-native';
import { PERMISSIONS, requestMultiple } from 'react-native-permissions';

import { store } from '@/store';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import { isVoiceCallEnabled } from '@/utils/inboxUtils';

// What a call needs before the first ring: the microphone on both platforms, and on
// Android the Bluetooth connect permission that lets a headset be offered as a route.
const callPermissions = () => {
  if (Platform.OS === 'ios') return [PERMISSIONS.IOS.MICROPHONE];
  if (Number(Platform.Version) >= 31) {
    return [PERMISSIONS.ANDROID.RECORD_AUDIO, PERMISSIONS.ANDROID.BLUETOOTH_CONNECT];
  }
  return [PERMISSIONS.ANDROID.RECORD_AUDIO];
};

// Asks for what a call will need, rather than leaving it until a caller is already
// ringing. Only accounts with an inbox that can call are asked. The platform prompts
// only while a permission is undecided, so this asks again after one is taken away and
// stays silent otherwise; a refusal is left alone, since the call asks again when it
// needs them.
export const runCallReadiness = async () => {
  const inboxes = selectAllInboxes(store.getState());
  if (!inboxes.some(isVoiceCallEnabled)) return;

  await requestMultiple(callPermissions());
};
