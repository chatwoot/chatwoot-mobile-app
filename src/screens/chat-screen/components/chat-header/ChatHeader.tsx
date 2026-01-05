import {
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import React from 'react';
import { ImageSourcePropType, Keyboard, Platform, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { Avatar, BottomSheetBackdrop, BottomSheetWrapper, Icon } from '@/components-next';
import { useRefsContext } from '@/context';
import { ChevronLeft, OpenIcon, Overflow, ResolvedIcon, SLAIcon, SelfAssign } from '@/svg-icons';
import { FunnelIcon } from '@/svg-icons/conversation-icons/assignToFunnel';
import { MoveIcon } from '@/svg-icons/conversation-icons/moveIcon';
import { tailwind } from '@/theme';
import { SLAEvent } from '@/types/common';
import { ChatDropdownMenu, DashboardList } from './DropdownMenu';
import { SlaEvents } from './SlaEvents';

type ChatHeaderProps = {
  name: string;
  imageSrc: ImageSourcePropType;
  isResolved: boolean;
  isSlaMissed?: boolean;
  hasSla?: boolean;
  slaEvents?: SLAEvent[];
  dashboardsList: DashboardList[];
  statusText?: string;
  onBackPress: () => void;
  onContactDetailsPress: () => void;
  onToggleChatStatus: () => void;
  onAssignToMe?: () => void;
  isAssignedToMe?: boolean;
  onNextStagePress?: () => void;
  onAssignToFunnelPress?: () => void;
  hasKanbanItem?: boolean;
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
  onBackPress,
  onContactDetailsPress,
  onToggleChatStatus,
  onAssignToMe,
  isAssignedToMe = false,
  onNextStagePress,
  onAssignToFunnelPress,
  hasKanbanItem = false,
}: ChatHeaderProps) => {
  const { slaEventsSheetRef } = useRefsContext();

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
          <Pressable
            onPress={onContactDetailsPress}
            style={tailwind.style('flex flex-row items-center flex-1')}>
            <Avatar size="xl" src={imageSrc} name={name} />
            <Animated.View style={tailwind.style('pl-2')}>
              <Animated.Text
                numberOfLines={1}
                style={tailwind.style(
                  'text-[17px] font-inter-medium-24 tracking-[0.32px] text-gray-950',
                )}>
                {name}
              </Animated.Text>
            </Animated.View>
          </Pressable>
        </Animated.View>

        <Animated.View
          style={tailwind.style(
            `flex flex-row flex-1 justify-end ${Platform.OS === 'ios' ? 'gap-4' : ''}`,
          )}>
          <Animated.View style={tailwind.style('flex flex-row items-center gap-4')}>
            {hasKanbanItem && onNextStagePress && (
              <Pressable
                hitSlop={8}
                onPress={onNextStagePress}
                style={tailwind.style(
                  'h-8 w-8 flex items-center justify-center bg-transparent rounded-lg',
                )}>
                <Icon icon={<MoveIcon color="#858585" strokeWidth={1.5} />} size={20} />
              </Pressable>
            )}
            {!hasKanbanItem && onAssignToFunnelPress && (
              <Pressable
                hitSlop={8}
                onPress={onAssignToFunnelPress}
                style={tailwind.style(
                  'h-8 w-8 flex items-center justify-center bg-transparent rounded-lg',
                )}>
                <Icon icon={<FunnelIcon color="#858585" strokeWidth={1.5} />} size={20} />
              </Pressable>
            )}
            {onAssignToMe && !isAssignedToMe && (
              <Pressable hitSlop={8} onPress={onAssignToMe}>
                <Icon icon={<SelfAssign />} size={24} />
              </Pressable>
            )}
            {hasSla && (
              <Pressable hitSlop={8} onPress={toggleSlaEventsSheet}>
                <Icon icon={<SLAIcon color={isSlaMissed ? '#E13D45' : '#BBBBBB'} />} size={24} />
              </Pressable>
            )}
            <Pressable hitSlop={8} onPress={onToggleChatStatus}>
              <Icon
                icon={
                  isResolved ? (
                    <ResolvedIcon strokeWidth={1.5} stroke={tailwind.color('bg-green-700')} />
                  ) : (
                    <OpenIcon strokeWidth={1.5} />
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
        handleIndicatorStyle={tailwind.style(
          'overflow-hidden bg-blackA-A6 w-8 h-1 mb-2 rounded-[11px]',
        )}
        enablePanDownToClose
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        snapPoints={['36%']}>
        <BottomSheetWrapper>
          <BottomSheetScrollView style={{ flex: 1 }}>
            <SlaEvents slaEvents={slaEvents} statusText={statusText ?? ''} />
          </BottomSheetScrollView>
        </BottomSheetWrapper>
      </BottomSheetModal>
    </Animated.View>
  );
};
