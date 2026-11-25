import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTailwind } from '@/theme/useTailwind';
import i18n from '@/i18n';
import { SideToolbarButton } from '@/components-next/side-toolbar';
import { SIDE_STATUS_BAR_CLEARANCE, SIDE_STATUS_BAR_CLEARANCE_COMPACT } from '@/constants';
import { CaretLeftGlyph, ChevronLeft } from '@/svg-icons';
import { IOS_DESIGN, useIsSplitLayout, useSideTabBarLayout } from '@/utils';

import { PILL_SHADOW, useCallTheme } from '../constants/callTheme';
import { CallSurface } from './CallSurface';
import { ChatwootMark } from './ChatwootMark';

type CallHeaderProps = {
  canMinimise: boolean;
  onMinimise: () => void;
};

const CallTitle = () => {
  const tailwind = useTailwind();
  return (
    <>
      <ChatwootMark size={20} />
      <Text
        numberOfLines={1}
        style={tailwind.style(
          'font-inter-medium-24 text-[17px] leading-[22px] text-gray-950 shrink',
        )}>
        {i18n.t('CONVERSATION.VOICE_WIDGET.CALL_SCREEN_TITLE')}
      </Text>
    </>
  );
};

export const CallHeader = (props: CallHeaderProps) => {
  const sideTabBar = useSideTabBarLayout();
  return sideTabBar ? <SideCallHeader {...props} /> : <PhoneCallHeader {...props} />;
};

const SideCallHeader = ({ canMinimise, onMinimise }: CallHeaderProps) => {
  const tailwind = useTailwind();
  const insets = useSafeAreaInsets();
  const sideTabBar = useSideTabBarLayout();
  const isSplit = useIsSplitLayout();
  if (!sideTabBar) return null;
  const sideInset = Math.max(insets.left, insets.right);
  return (
    <>
      <View
        style={[
          tailwind.style('absolute h-9 mt-1 flex-row items-center justify-center gap-2'),
          { top: insets.top + sideTabBar.contentTopPadding, left: sideInset, right: sideInset },
        ]}>
        <CallTitle />
      </View>
      {canMinimise ? (
        <View
          style={[
            tailwind.style('absolute'),
            { top: isSplit ? SIDE_STATUS_BAR_CLEARANCE : SIDE_STATUS_BAR_CLEARANCE_COMPACT },
            sideTabBar.edge === 'right'
              ? { right: sideTabBar.offset }
              : { left: sideTabBar.offset },
          ]}>
          <SideToolbarButton
            icon={<ChevronLeft stroke={tailwind.color('text-gray-950')} strokeWidth={1.5} />}
            onPress={onMinimise}
            accessibilityLabel={i18n.t('CONVERSATION.VOICE_WIDGET.MINIMISE')}
          />
        </View>
      ) : null}
    </>
  );
};

const PhoneCallHeader = ({ canMinimise, onMinimise }: CallHeaderProps) => {
  const tailwind = useTailwind();
  const { CALL_INK } = useCallTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        tailwind.style('absolute h-11 px-5 flex-row items-center gap-3'),
        { top: insets.top, left: insets.left, right: insets.right },
      ]}>
      {canMinimise && IOS_DESIGN ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={i18n.t('CONVERSATION.VOICE_WIDGET.MINIMISE')}
          onPress={onMinimise}>
          <CallSurface
            radius={18}
            shadow={PILL_SHADOW}
            interactive
            style={tailwind.style('h-9 w-9 items-center justify-center')}>
            <CaretLeftGlyph color={CALL_INK} size={22} />
          </CallSurface>
        </Pressable>
      ) : canMinimise ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={i18n.t('CONVERSATION.VOICE_WIDGET.MINIMISE')}
          onPress={onMinimise}
          hitSlop={12}
          style={tailwind.style('h-[22px] w-[22px]')}>
          <CaretLeftGlyph color={CALL_INK} size={22} />
        </Pressable>
      ) : null}
      <CallTitle />
    </View>
  );
};
