import React from 'react';
import { Pressable, Text, Animated, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import { showToast } from '@/utils/toastUtils';
import { tailwind } from '@/theme';
import { useThemedStyles } from '@/hooks';
import { useHaptic } from '@/utils';
import { useAppSelector } from '@/hooks';
import {
  selectChatwootVersion,
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
    key: 'chatwoot_version',
    label: 'Chatwoot Version',
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
  const themedTailwind = useThemedStyles();
  const installationUrl = useAppSelector(selectInstallationUrl);
  const webSocketUrl = useAppSelector(selectWebSocketUrl);
  const version = useAppSelector(selectChatwootVersion);
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
      case 'chatwoot_version':
        return version;
      case 'push_token':
        return pushToken;
      default:
        return '';
    }
  };

  return (
    <Pressable onPress={() => handlePress(item)}>
      <Animated.View style={themedTailwind.style('flex flex-row items-center')}>
        <Animated.View
          style={themedTailwind.style(
            'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
            !isLastItem && 'border-b-[1px] border-blackA-A3',
          )}
        >
          <View>
            <Text
              style={themedTailwind.style(
                'text-base  text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px]',
              )}
            >
              {item.label}
            </Text>
            <Text
              numberOfLines={2}
              style={themedTailwind.style(
                'text-sm text-gray-900 font-inter-420-20 leading-[18px] tracking-[0.16px] italic',
              )}
            >
              {debugValue(item.key)}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export const DebugActions = () => {
  const themedTailwind = useThemedStyles();
  return (
    <Animated.View style={themedTailwind.style('py-1 pl-3')}>
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
};
