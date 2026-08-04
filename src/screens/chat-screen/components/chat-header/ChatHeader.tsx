import React from 'react';
import { ImageSourcePropType, Keyboard, Platform, Pressable } from 'react-native';
import { BottomSheetModal, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import Animated from 'react-native-reanimated';

import { Avatar, Icon } from '@/components-next';
import { CaretRight, ChevronLeft, OpenIcon, Overflow, ResolvedIcon, SLAIcon } from '@/svg-icons';
import { BottomSheetBackdrop, BottomSheetWrapper } from '@/components-next';
import { tailwind } from '@/theme';
import { ChatDropdownMenu, DashboardList } from './DropdownMenu';
import { SLAEvent } from '@/types/common';
import { useRefsContext } from '@/context';
import { SlaEvents } from './SlaEvents';
import i18n from '@/i18n';
import type { FunnelStage } from '@/store/funnel/funnelTypes';

// [conomni] задача C7: то, что должна показать шапка под именем клиента — либо название
// и цвет текущего этапа воронки, либо нейтральное «Без этапа». Вынесено чистой функцией
// ради тестируемости (в проекте нет @testing-library, компоненты не рендерятся в тестах —
// тот же приём, что ChannelBrandMark.tsx над resolveChannelBrandMark).
export type StageDisplay = {
  label: string;
  color: string | null;
  isNone: boolean;
};

export const resolveStageDisplay = (stage?: FunnelStage | null): StageDisplay => {
  if (!stage) {
    return { label: i18n.t('CONOMNI.STAGE.NONE'), color: null, isNone: true };
  }
  return { label: stage.name, color: stage.color, isNone: false };
};

type ChatHeaderProps = {
  name: string;
  imageSrc: ImageSourcePropType;
  isResolved: boolean;
  isSlaMissed?: boolean;
  hasSla?: boolean;
  slaEvents?: SLAEvent[];
  dashboardsList: DashboardList[];
  statusText?: string;
  stage?: FunnelStage | null;
  onBackPress: () => void;
  onContactDetailsPress: () => void;
  onToggleChatStatus: () => void;
  onStagePress?: () => void;
};

export const ChatHeader = ({
  name,
  imageSrc,
  isResolved,
  slaEvents,
  isSlaMissed,
  hasSla,
  statusText,
  dashboardsList,
  stage,
  onBackPress,
  onContactDetailsPress,
  onToggleChatStatus,
  onStagePress,
}: ChatHeaderProps) => {
  const { slaEventsSheetRef } = useRefsContext();
  const stageDisplay = resolveStageDisplay(stage);
  const stageColor = stageDisplay.isNone
    ? (tailwind.color('text-gray-600') as string)
    : (stageDisplay.color as string);

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const toggleSlaEventsSheet = () => {
    if (slaEvents?.length) {
      Keyboard.dismiss();
      slaEventsSheetRef.current?.present();
    }
  };

  return (
    <Animated.View style={[tailwind.style('border-b-[1px] border-b-blackA-A3')]}>
      <Animated.View style={tailwind.style('flex flex-row justify-between items-center px-4 py-2')}>
        <Animated.View style={tailwind.style('flex-1 flex-row gap-2 items-center justify-center')}>
          <Pressable
            hitSlop={8}
            style={tailwind.style('h-8 w-8 flex  justify-center items-start')}
            onPress={onBackPress}>
            <Icon icon={<ChevronLeft />} size={24} />
          </Pressable>
          <Animated.View style={tailwind.style('flex-1')}>
            <Pressable
              onPress={onContactDetailsPress}
              style={tailwind.style('flex flex-row items-center')}>
              <Avatar size="xl" src={imageSrc} name={name} />
              <Animated.View style={tailwind.style('pl-2 flex-1')}>
                <Animated.Text
                  numberOfLines={1}
                  style={tailwind.style(
                    'text-[17px] font-inter-medium-24 tracking-[0.32px] text-gray-950',
                  )}>
                  {name}
                </Animated.Text>
              </Animated.View>
            </Pressable>
            {/* [conomni] задача C7: этап воронки под именем клиента — своим цветом, «Без
                этапа» нейтральным; тап открывает шторку выбора этапа (ChatHeaderContainer). */}
            <Pressable
              hitSlop={4}
              onPress={onStagePress}
              style={tailwind.style('flex flex-row items-center pl-10 -mt-0.5')}>
              <Animated.Text
                numberOfLines={1}
                style={[
                  tailwind.style('text-[13px] font-inter-420-20 leading-4'),
                  { color: stageColor },
                ]}>
                {stageDisplay.label}
              </Animated.Text>
              <Icon icon={<CaretRight stroke={stageColor} />} size={12} />
            </Pressable>
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={tailwind.style(
            `flex flex-row flex-1 justify-end ${Platform.OS === 'ios' ? 'gap-4' : ''}`,
          )}>
          <Animated.View style={tailwind.style('flex flex-row items-center gap-4')}>
            {hasSla && (
              <Pressable hitSlop={8} onPress={toggleSlaEventsSheet}>
                <Icon icon={<SLAIcon color={isSlaMissed ? '#E13D45' : '#BBBBBB'} />} size={24} />
              </Pressable>
            )}
            <Pressable hitSlop={8} onPress={onToggleChatStatus}>
              <Icon
                icon={
                  isResolved ? (
                    <ResolvedIcon strokeWidth={2} stroke={tailwind.color('bg-green-700')} />
                  ) : (
                    <OpenIcon strokeWidth={2} />
                  )
                }
                size={24}
              />
            </Pressable>
          </Animated.View>
          {dashboardsList.length > 0 && (
            <ChatDropdownMenu dropdownMenuList={dashboardsList}>
              <Icon icon={<Overflow strokeWidth={2} />} size={24} />
            </ChatDropdownMenu>
          )}
        </Animated.View>
      </Animated.View>
      <BottomSheetModal
        ref={slaEventsSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        enablePanDownToClose
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        snapPoints={['36%']}>
        <BottomSheetWrapper>
          <SlaEvents slaEvents={slaEvents} statusText={statusText ?? ''} />
        </BottomSheetWrapper>
      </BottomSheetModal>
    </Animated.View>
  );
};
