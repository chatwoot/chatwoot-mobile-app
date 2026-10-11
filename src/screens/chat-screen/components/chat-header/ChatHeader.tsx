import React from 'react';
import { getChannelIcon } from '@/utils/getChannelIcon';
import type { Inbox } from '@/types/Inbox';
import type { ConversationAdditionalAttributes } from '@/types/Conversation';
import { ImageSourcePropType, Keyboard, Platform, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { Avatar, Icon } from '@/components-next';
import { ChevronLeft, Overflow, ResolvedIcon, SLAIcon } from '@/svg-icons';
import { Sheet } from '@/components-next/common/sheet/Sheet';
import { tailwind } from '@/theme';
import { ChatDropdownMenu, DashboardList } from './DropdownMenu';
import { SLAEvent } from '@/types/common';
import { useRefsContext } from '@/context';
import { SlaEvents } from './SlaEvents';

type ChatHeaderProps = {
  name: string;
  inbox?: Inbox;
  additionalAttributes?: ConversationAdditionalAttributes;
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
  inbox,
  additionalAttributes,
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
            style={tailwind.style('flex flex-row items-center flex-1 min-w-0')}>
            <Avatar size="xl" src={imageSrc} name={name} />
            <Animated.View style={tailwind.style('pl-2 flex-1')}>
              <Animated.Text
                numberOfLines={1}
                style={tailwind.style(
                  'text-[17px] font-inter-medium-24 tracking-[0.32px] text-gray-950',
                )}>
                {name}
              </Animated.Text>
              {inbox && (
                <Animated.View style={tailwind.style('flex-row items-center gap-1')}>
                  <Icon
                    icon={getChannelIcon(
                      inbox.channelType,
                      inbox.medium,
                      additionalAttributes?.type ?? '',
                    )}
                    size={12}
                  />
                  <Animated.Text
                    testID="chat.header.inbox-name"
                    numberOfLines={1}
                    style={tailwind.style('text-xs text-gray-900 flex-shrink')}>
                    {inbox.name}
                  </Animated.Text>
                </Animated.View>
              )}
            </Animated.View>
          </Pressable>
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
                  <ResolvedIcon
                    strokeWidth={2}
                    {...(isResolved && { stroke: tailwind.color('bg-green-700') })}
                  />
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
      <Sheet ref={slaEventsSheetRef} detents={[0.36]}>
        <SlaEvents slaEvents={slaEvents} statusText={statusText ?? ''} />
      </Sheet>
    </Animated.View>
  );
};
