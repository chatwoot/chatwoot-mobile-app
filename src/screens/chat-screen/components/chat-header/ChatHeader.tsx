import React from 'react';
import { ImageSourcePropType, Keyboard, Platform, Pressable } from 'react-native';
import { BottomSheetModal, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import Animated from 'react-native-reanimated';

import { Avatar, Icon } from '@/components-next';
import { ChevronLeft, OpenIcon, Overflow, ResolvedIcon, SLAIcon } from '@/svg-icons';
import { BottomSheetBackdrop, BottomSheetWrapper } from '@/components-next';
import { tailwind } from '@/theme';
import { ChatDropdownMenu, DashboardList } from './DropdownMenu';
import { SLAEvent } from '@/types/common';
import { useRefsContext } from '@/context';
import { SlaEvents } from './SlaEvents';

type ChatHeaderProps = {
  name: string;
  subtitle?: string;
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
};

export const ChatHeader = ({
  name,
  subtitle,
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
        <Animated.View style={tailwind.style('flex-1 flex-row gap-2 items-center')}>
          <Pressable
            hitSlop={8}
            style={tailwind.style('h-8 w-8 flex  justify-center items-start')}
            onPress={onBackPress}>
            <Icon icon={<ChevronLeft />} size={24} />
          </Pressable>
          <Pressable
            onPress={onContactDetailsPress}
            style={tailwind.style('min-w-0 flex-1 flex-row items-center')}>
            <Avatar size="xl" src={imageSrc} name={name} />
            <Animated.View style={tailwind.style('min-w-0 flex-1 pl-2')}>
              <Animated.Text
                numberOfLines={1}
                style={tailwind.style(
                  'text-[17px] font-inter-medium-24 tracking-[0.32px] text-gray-950',
                )}>
                {name}
              </Animated.Text>
              {!!subtitle && (
                <Animated.Text
                  numberOfLines={1}
                  style={tailwind.style(
                    'text-xs font-inter-420-20 tracking-[0.32px] text-gray-700 pt-0.5',
                  )}>
                  {subtitle}
                </Animated.Text>
              )}
            </Animated.View>
          </Pressable>
        </Animated.View>

        <Animated.View
          style={tailwind.style(
            `flex-shrink-0 flex-row justify-end ${Platform.OS === 'ios' ? 'gap-4' : ''}`,
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
