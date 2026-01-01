import React from 'react';
import { Pressable, Text, Animated, View } from 'react-native';
// import Clipboard from '@react-native-clipboard/clipboard';

import { showToast } from '@/utils/toastUtils';
import { tailwind } from '@/theme';

let Clipboard: any = null;
try {
  Clipboard = require('@react-native-clipboard/clipboard').default;
} catch (e) {
  console.warn('@react-native-clipboard/clipboard not available');
  Clipboard = {
    setString: () => {},
    getString: () => Promise.resolve(''),
  };
}

import { useHaptic } from '@/utils';
import { useAppSelector } from '@/hooks';
import {
  selectAlooChatVersion,
  selectInstallationUrl,
  selectPushToken,
  selectWebSocketUrl,
} from '@/store/settings/settingsSelectors';

type DebugActionCellProps = {
  item: DebugAction;
  index: number;
  isLastItem: boolean;
};

interface DebugAction {
  key: string;
  label: string;
  value?: string;
}

const DEBUG_ACTIONS: DebugAction[] = [
  {
    key: 'AlooChat_version',
    label: 'AlooChat Version',
    value: '',
  },
  {
    key: 'installation_url',
    label: 'Installation URL',
    value: '',
  },
  {
    key: 'web_socket_url',
    label: 'Web Socket URL',
    value: '',
  },
  {
    key: 'push_token',
    label: 'Push Token',
    value: '',
  },
];

const DebugActionCell = ({ item, index, isLastItem }: DebugActionCellProps) => {
  const installationUrl = useAppSelector(selectInstallationUrl);
  const webSocketUrl = useAppSelector(selectWebSocketUrl);
  const version = useAppSelector(selectAlooChatVersion);
  const pushToken = useAppSelector(selectPushToken);

  const hapticSelection = useHaptic();

  const handlePress = (item: DebugAction) => {
    const value = debugValue(item.key);
    hapticSelection?.();
    if (value) {
      Clipboard.setString(value);
      showToast({ message: `${item.label} copied to clipboard` });
    }
  };

  const debugValue = (key: string) => {
    switch (key) {
      case 'installation_url':
        return installationUrl;
      case 'web_socket_url':
        return webSocketUrl;
      case 'AlooChat_version':
        return version;
      case 'push_token':
        return pushToken;
      default:
        return '';
    }
  };

  return (
    <Pressable onPress={() => handlePress(item)}>
      <Animated.View style={tailwind.style('flex flex-row items-center')}>
        <Animated.View
          style={tailwind.style(
            'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
            !isLastItem && 'border-b-[1px] border-blackA-A3',
          )}>
          <View>
            <Text
              style={tailwind.style(
                'text-base  text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px]',
              )}>
              {item.label}
            </Text>
            <Text
              numberOfLines={2}
              style={tailwind.style(
                'text-sm text-gray-900 font-inter-420-20 leading-[18px] tracking-[0.16px] italic',
              )}>
              {debugValue(item.key)}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export const DebugActions = () => (
  <Animated.View style={tailwind.style('py-1 pl-3')}>
    {DEBUG_ACTIONS.map((item, index) => (
      <DebugActionCell
        key={item.key}
        item={item}
        index={index}
        isLastItem={index === DEBUG_ACTIONS.length - 1}
      />
    ))}
  </Animated.View>
);
