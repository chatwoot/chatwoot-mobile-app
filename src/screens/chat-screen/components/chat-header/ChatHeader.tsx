import React from 'react';
import { ImageSourcePropType, Keyboard, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { Avatar, Icon } from '@/components-next';
import { ChevronLeft, Overflow, SLAIcon, StatusOpenIcon, StatusResolvedIcon } from '@/svg-icons';
import { Sheet } from '@/components-next/common/sheet/Sheet';
import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { ChatDropdownMenu, DashboardList } from './DropdownMenu';
import { SLAEvent } from '@/types/common';
import { useRefsContext } from '@/context';
import { SlaEvents } from './SlaEvents';

type ChatHeaderProps = {
  name: string;
  imageSrc: ImageSourcePropType;
  isResolved: boolean;
  showDetailsRow?: boolean;
  inboxName?: string;
  channelIcon?: React.ReactNode;
  isSlaMissed?: boolean;
  hasSla?: boolean;
  slaType?: string;
  slaEvents?: SLAEvent[];
  dashboardsList: DashboardList[];
  statusText?: string;
  onBackPress: () => void;
  onContactDetailsPress: () => void;
  onToggleChatStatus: () => void;
};

export const ChatHeader = ({
  name,
  imageSrc,
  isResolved,
  showDetailsRow = true,
  inboxName,
  channelIcon,
  slaEvents,
  isSlaMissed,
  hasSla,
  slaType,
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
    <Animated.View style={tailwind.style('border-b-[1px] border-b-slate-100')}>
      <Animated.View style={tailwind.style('flex flex-row items-center gap-3 px-4 pt-2 pb-[13px]')}>
        <Pressable
          hitSlop={8}
          style={tailwind.style('h-6 w-6 justify-center items-start')}
          onPress={onBackPress}>
          <Icon icon={<ChevronLeft />} size={24} />
        </Pressable>
        <Pressable
          onPress={onContactDetailsPress}
          style={tailwind.style('flex flex-row items-center gap-2 flex-1')}>
          <Avatar size="md" src={imageSrc} name={name} />
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style(
              'flex-shrink text-[17px] font-inter-medium-24 tracking-[0.34px] text-gray-950',
            )}>
            {name}
          </Animated.Text>
        </Pressable>
        {dashboardsList.length > 0 && (
          <Animated.View style={tailwind.style('h-8 w-8 items-center justify-center')}>
            <ChatDropdownMenu dropdownMenuList={dashboardsList}>
              <Icon icon={<Overflow strokeWidth={2} />} size={24} />
            </ChatDropdownMenu>
          </Animated.View>
        )}
      </Animated.View>

      {showDetailsRow && (
        <Animated.View
          style={tailwind.style(
            'flex flex-row items-center justify-between gap-3 px-[15px] pb-[13px]',
          )}>
          {inboxName ? (
            <Animated.View
              style={tailwind.style(
                'flex-shrink flex-row items-center gap-1.5 h-8 pl-2 pr-3 rounded-lg bg-white border border-gray-300',
              )}>
              {channelIcon ? <Icon icon={channelIcon} size={16} /> : null}
              <Animated.Text
                numberOfLines={1}
                style={tailwind.style(
                  'flex-shrink max-w-[160px] text-[15px] font-inter-normal-20 tracking-[0.3px] text-gray-950',
                )}>
                {inboxName}
              </Animated.Text>
            </Animated.View>
          ) : (
            <Animated.View />
          )}

          <Animated.View style={tailwind.style('flex flex-row items-center gap-[11px]')}>
            {hasSla && (
              <Pressable
                hitSlop={4}
                onPress={toggleSlaEventsSheet}
                style={tailwind.style(
                  'flex-row items-center gap-1.5 h-8 pl-[9px] pr-3 rounded-lg bg-gray-100',
                )}>
                <Icon icon={<SLAIcon color={isSlaMissed ? '#E13D45' : '#858585'} />} size={17} />
                {slaType ? (
                  <Animated.Text
                    style={tailwind.style(
                      'text-[15px] font-inter-medium-24 tracking-[0.225px]',
                      isSlaMissed ? 'text-ruby-800' : 'text-gray-950',
                    )}>
                    {slaType}
                  </Animated.Text>
                ) : null}
              </Pressable>
            )}
            <Pressable
              hitSlop={4}
              onPress={onToggleChatStatus}
              style={tailwind.style(
                'flex-row items-center gap-1.5 h-8 pl-[9px] pr-3 rounded-lg bg-gray-100',
              )}>
              <Icon icon={isResolved ? <StatusOpenIcon /> : <StatusResolvedIcon />} size={16} />
              <Animated.Text
                style={tailwind.style(
                  'text-[15px] font-inter-medium-24 tracking-[0.225px] text-gray-950',
                )}>
                {isResolved ? i18n.t('CONVERSATION.REOPEN') : i18n.t('CONVERSATION.RESOLVE')}
              </Animated.Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}
      <Sheet ref={slaEventsSheetRef} detents={[0.36]}>
        <SlaEvents slaEvents={slaEvents} statusText={statusText ?? ''} />
      </Sheet>
    </Animated.View>
  );
};
