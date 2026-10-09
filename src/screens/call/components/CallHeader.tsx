import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { CaretLeftGlyph } from '@/svg-icons';

import { CALL_INK } from '../constants/callTheme';
import { ChatwootMark } from './ChatwootMark';

type CallHeaderProps = {
  // Over a lock screen there is no way back into the app, so no minimise caret
  canMinimise: boolean;
  onMinimise: () => void;
};

// What kind of call this is, with the caret that tucks the call into the banner
export const CallHeader = ({ canMinimise, onMinimise }: CallHeaderProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        tailwind.style('absolute left-0 right-0 h-11 px-5 flex-row items-center gap-3'),
        { top: insets.top },
      ]}>
      {canMinimise ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={i18n.t('CONVERSATION.VOICE_WIDGET.MINIMISE')}
          onPress={onMinimise}
          hitSlop={12}
          style={tailwind.style('h-[22px] w-[22px]')}>
          <CaretLeftGlyph color={CALL_INK} size={22} />
        </Pressable>
      ) : null}
      <ChatwootMark size={20} />
      <Text
        numberOfLines={1}
        style={tailwind.style(
          'font-inter-medium-24 text-[17px] leading-[22px] text-gray-950 shrink',
        )}>
        {i18n.t('CONVERSATION.VOICE_WIDGET.CALL_SCREEN_TITLE')}
      </Text>
    </View>
  );
};
