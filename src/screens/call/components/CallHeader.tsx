import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { ChevronLeft } from '@/svg-icons';

import { CALL_INK } from '../constants/callTheme';
import { ChatwootMark } from './ChatwootMark';

type CallHeaderProps = {
  inboxName: string;
  // Over a lock screen there is no way back into the app, so no minimise chevron
  canMinimise: boolean;
  onMinimise: () => void;
};

// The inbox the call came through, with the chevron that tucks the call into the banner
export const CallHeader = ({ inboxName, canMinimise, onMinimise }: CallHeaderProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        tailwind.style('absolute left-0 right-0 h-11 px-5 flex-row items-center gap-3'),
        { top: insets.top + 8 },
      ]}>
      {canMinimise ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={i18n.t('CONVERSATION.VOICE_WIDGET.MINIMISE')}
          onPress={onMinimise}
          hitSlop={12}
          style={tailwind.style('h-6 w-6 -ml-1')}>
          <ChevronLeft stroke={CALL_INK} />
        </Pressable>
      ) : null}
      <ChatwootMark size={20} />
      <Text
        numberOfLines={1}
        style={tailwind.style(
          'font-inter-medium-24 text-[17px] leading-[22px] text-gray-950 shrink',
        )}>
        {inboxName}
      </Text>
    </View>
  );
};
