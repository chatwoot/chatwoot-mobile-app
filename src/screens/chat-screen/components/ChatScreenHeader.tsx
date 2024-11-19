import React, { useMemo } from 'react';
import { ImageSourcePropType, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { StackActions, useNavigation } from '@react-navigation/native';

import { Avatar, Icon } from '@/components-next';
import { useChatWindowContext, useRefsContext } from '@/context';
import { ChevronLeft, OpenIcon, Overflow, ResolvedIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { showToast } from '@/helpers/ToastHelper';
import i18n from '@/i18n';

import { ChatDropdownMenu, DashboardList } from './DropdownMenu';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { conversationActions } from '@/store/conversation/conversationActions';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { CONVERSATION_STATUS } from '@/constants';
import { ConversationStatus } from '@/types/common/ConversationStatus';
type ChatScreenHeaderProps = {
  name: string;
  imageSrc: ImageSourcePropType;
};

export const ChatScreenHeader = (props: ChatScreenHeaderProps) => {
  const { name, imageSrc } = props;
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { conversationId } = useChatWindowContext();
  const conversation = useAppSelector(state => selectConversationById(state, conversationId));

  const conversationStatus = conversation?.status;

  const isResolved = conversationStatus === CONVERSATION_STATUS.RESOLVED;

  const { chatPagerView } = useRefsContext();
  const { pagerViewIndex } = useChatWindowContext();

  const handleBackPress = () => {
    navigation.dispatch(StackActions.pop());
  };

  const handleNavigationToContactDetails = () => {
    const navigateToScreen = StackActions.push('ContactDetails', { conversationId });
    navigation.dispatch(navigateToScreen);
  };

  const handleNavigation = (url?: string, title?: string) => {
    if (url) {
      const navigateToScreen = StackActions.push('Dashboard', { url, title });
      navigation.dispatch(navigateToScreen);
    } else {
      chatPagerView.current?.setPage(1);
    }
  };

  const toggleChatStatus = async () => {
    const updatedStatus =
      conversationStatus === CONVERSATION_STATUS.RESOLVED
        ? CONVERSATION_STATUS.OPEN
        : CONVERSATION_STATUS.RESOLVED;
    await dispatch(
      conversationActions.toggleConversationStatus({
        conversationId,
        payload: { status: updatedStatus as ConversationStatus, snoozed_until: null },
      }),
    );

    showToast({
      message: i18n.t('CONVERSATION.STATUS_CHANGE'),
    });
  };

  const dashboardsList = useMemo(() => {
    return [
      pagerViewIndex === 0
        ? {
            title: 'Conversation Actions',
            onSelect: handleNavigation,
          }
        : null,
      {
        title: 'Chatwoot AI',
        url: 'https://chatwoot.ai/',
        onSelect: handleNavigation,
      },
      {
        title: 'Changelog',
        url: 'https://github.com/chatwoot/chatwoot-mobile-app/releases/tag/1.10.26',
        onSelect: handleNavigation,
      },
    ].filter(Boolean) as DashboardList[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagerViewIndex]);

  return (
    <Animated.View style={[tailwind.style('border-b-[1px] border-b-blackA-A3')]}>
      <Animated.View
        style={tailwind.style(
          'flex flex-row justify-between items-center px-4 pt-[13px] pb-[12px]',
        )}>
        <Animated.View style={tailwind.style('flex-1')}>
          <Pressable hitSlop={8} style={tailwind.style('h-6 w-6')} onPress={handleBackPress}>
            <Icon icon={<ChevronLeft />} size={24} />
          </Pressable>
        </Animated.View>
        <Pressable
          hitSlop={{ top: 8, bottom: 8, left: 20, right: 20 }}
          onPress={handleNavigationToContactDetails}
          style={tailwind.style('flex flex-row justify-center items-center flex-1')}>
          <Avatar size="md" src={imageSrc} name={name} />
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
        <Animated.View style={tailwind.style('flex flex-row items-center justify-end flex-1')}>
          <Pressable hitSlop={8} onPress={toggleChatStatus}>
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
          <ChatDropdownMenu dropdownMenuList={dashboardsList}>
            <Icon icon={<Overflow strokeWidth={2} />} size={24} />
          </ChatDropdownMenu>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};
