import React from 'react';
import { ImageSourcePropType, Keyboard, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { Avatar, Icon } from '@/components-next';
import {
  ChevronLeft,
  CloseIcon,
  InfoCircleIcon,
  Overflow,
  SLAIcon,
  StatusOpenIcon,
  StatusResolvedIcon,
} from '@/svg-icons';
import { Sheet } from '@/components-next/common/sheet/Sheet';
import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { ChatDropdownMenu, DashboardList } from './DropdownMenu';
import { SLAEvent } from '@/types/common';
import { useRefsContext } from '@/context';
import { SlaEvents } from './SlaEvents';
import { useIOSListText } from '@/utils';
import { useIsInDetailPane, useSplitView } from '@/navigation/split/SplitViewContext';
import { useSideToolbar } from '@/context';
import { HEADER_ICON_COLOR, SideToolbarButton } from '@/components-next/side-toolbar';
import { usePaneRightInset } from '@/navigation/split/usePaneRightInset';

type ChatHeaderProps = {
  name: string;
  imageSrc: ImageSourcePropType;
  isOpen?: boolean;
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
  // SLA time left or overdue (e.g. "2h 53m"), shown with the SLA label in the pane header.
  slaTime?: string;
  onBackPress: () => void;
  onContactDetailsPress: () => void;
  onToggleChatStatus: () => void;
  // Opens conversation actions (split view pane: a column on the right).
  onOpenActions?: () => void;
};

export const ChatHeader = ({
  name,
  imageSrc,
  isResolved,
  isOpen = !isResolved,
  showDetailsRow = true,
  inboxName,
  channelIcon,
  slaEvents,
  isSlaMissed,
  hasSla,
  slaType,
  statusText,
  slaTime,
  dashboardsList,
  onBackPress,
  onContactDetailsPress,
  onToggleChatStatus,
  onOpenActions,
}: ChatHeaderProps) => {
  const iosList = useIOSListText();
  const { slaEventsSheetRef } = useRefsContext();

  // In the split view's conversation pane (iPhone Duo), the header only shows who and
  // where; its actions move to the side toolbar below the status bar, ordered like Apple's
  // vertical toolbars: Close first, then Resolve/Reopen, then More.
  const isInPane = useIsInDetailPane();
  const paneRightInset = usePaneRightInset();
  const statusLabel = isOpen
    ? i18n.t('CONVERSATION.RESOLVE')
    : isResolved
      ? i18n.t('CONVERSATION.REOPEN')
      : i18n.t('CONVERSATION.OPEN');
  // On the actions page (swiped left) the toolbar shrinks to one back button that returns
  // to the messages.
  const { chatPagerView } = useRefsContext();
  const isOnActionsPage = !showDetailsRow;
  // In the pane, actions have their own toolbar button; More lists only dashboard apps.
  const paneMenuList = dashboardsList.filter(item => !!item.url);
  // With a secondary column open (contact, actions or a dashboard app), the toolbar is just a
  // back button.
  const splitView = useSplitView();
  const isContactOpen = !!splitView?.isSecondaryOpen;
  const actionsInToolbar =
    useSideToolbar(
      isContactOpen ? (
        <SideToolbarButton
          icon={<ChevronLeft stroke={HEADER_ICON_COLOR} />}
          onPress={() => splitView?.closeSecondary()}
          accessibilityLabel={i18n.t('CONVERSATION.HEADER.BACK')}
        />
      ) : isOnActionsPage ? (
        <SideToolbarButton
          icon={<ChevronLeft stroke={HEADER_ICON_COLOR} />}
          onPress={() => chatPagerView.current?.setPage(0)}
          accessibilityLabel={i18n.t('CONVERSATION.HEADER.BACK_TO_MESSAGES')}
        />
      ) : (
        <>
          <SideToolbarButton
            icon={<CloseIcon stroke={HEADER_ICON_COLOR} />}
            onPress={onBackPress}
            accessibilityLabel={i18n.t('CONVERSATION.HEADER.CLOSE')}
          />
          <SideToolbarButton
            icon={isOpen ? <StatusResolvedIcon /> : <StatusOpenIcon />}
            onPress={onToggleChatStatus}
            accessibilityLabel={statusLabel}
          />
          {onOpenActions ? (
            <SideToolbarButton
              icon={<InfoCircleIcon stroke={HEADER_ICON_COLOR} />}
              onPress={onOpenActions}
              accessibilityLabel={i18n.t('CONVERSATION_ACTION.TITLE')}
            />
          ) : null}
          {paneMenuList.length > 0 ? (
            <ChatDropdownMenu dropdownMenuList={paneMenuList} plainTrigger>
              <SideToolbarButton
                icon={<Overflow strokeWidth={2} />}
                accessibilityLabel={i18n.t('CONVERSATION.HEADER.MORE')}
              />
            </ChatDropdownMenu>
          ) : null}
        </>
      ),
      [
        isOpen,
        isResolved,
        dashboardsList,
        onBackPress,
        onToggleChatStatus,
        isOnActionsPage,
        isContactOpen,
        onOpenActions,
      ],
      isInPane,
    ) && isInPane;

  const toggleSlaEventsSheet = () => {
    Keyboard.dismiss();
    slaEventsSheetRef.current?.present();
  };

  // Split view pane: one compact row lined up with the list header next to it (its center
  // sits where the list header's 36pt row is centered). Avatar, then the name with the
  // inbox as a subtitle, and the SLA chip at the end. Actions are in the side toolbar.
  if (actionsInToolbar) {
    // Split view pane: one row centered on the list header's title row next to it. Avatar
    // and name with the inbox under it, and the SLA status at the end.
    return (
      // No divider, matching the list header next to it.
      <Animated.View>
        <Animated.View
          style={[
            tailwind.style('flex-row items-center gap-3 px-4 pt-0.5 pb-3'),
            { paddingRight: 16 + paneRightInset },
          ]}>
          <Pressable
            onPress={onContactDetailsPress}
            accessibilityRole="button"
            style={[tailwind.style('flex-row items-center gap-3'), { flexShrink: 1 }]}>
            <Avatar size="xl" initialsClassName="text-[13px]" src={imageSrc} name={name} />
            {/* Name, with the inbox (channel icon and name) as a second line. */}
            <Animated.View style={{ flexShrink: 1 }}>
              <Animated.Text
                numberOfLines={1}
                style={tailwind.style(
                  'text-[17px] leading-[22px] font-inter-semibold-20 text-gray-950',
                )}>
                {name}
              </Animated.Text>
              {inboxName ? (
                <Animated.View style={tailwind.style('flex-row items-center gap-1')}>
                  {channelIcon ? <Icon icon={channelIcon} size={13} /> : null}
                  {/* Full inbox name; wraps rather than being cut off if it's very long. */}
                  <Animated.Text
                    style={tailwind.style(
                      'flex-shrink text-[13px] leading-[18px] font-inter-normal-20 text-gray-700',
                    )}>
                    {inboxName}
                  </Animated.Text>
                </Animated.View>
              ) : null}
            </Animated.View>
          </Pressable>
          <Animated.View style={tailwind.style('flex-1')} />
          {/* SLA like in the conversation list: icon and label with its time, no pill. */}
          {hasSla ? (
            <Pressable
              hitSlop={8}
              onPress={toggleSlaEventsSheet}
              accessibilityRole="button"
              style={tailwind.style('flex-row items-center gap-1')}>
              <Icon icon={<SLAIcon color={isSlaMissed ? '#E13D45' : '#858585'} />} size={16} />
              {slaType ? (
                <Animated.Text
                  style={tailwind.style(
                    'text-[15px] font-inter-medium-24',
                    isSlaMissed ? 'text-ruby-800' : 'text-gray-950',
                  )}>
                  {slaTime ? `${slaType}: ${slaTime}` : slaType}
                </Animated.Text>
              ) : null}
            </Pressable>
          ) : null}
        </Animated.View>
        <Sheet ref={slaEventsSheetRef} detents={[0.36]}>
          <SlaEvents slaEvents={slaEvents} statusText={statusText ?? ''} />
        </Sheet>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={tailwind.style('border-b-[1px] border-b-slate-100')}>
      <Animated.View style={tailwind.style('flex flex-row items-center gap-3 px-4 pt-2 pb-[13px]')}>
        {actionsInToolbar ? null : (
          <Pressable
            hitSlop={8}
            style={tailwind.style('h-6 w-6 justify-center items-start')}
            onPress={onBackPress}>
            <Icon icon={<ChevronLeft />} size={24} />
          </Pressable>
        )}
        <Pressable
          onPress={onContactDetailsPress}
          style={tailwind.style('flex flex-row items-center gap-2 flex-1')}>
          {/* On the iOS list layout (iPhone Duo) a 32pt avatar with two-letter initials,
              matching the conversation list; 24pt with one letter elsewhere. */}
          <Avatar
            size={iosList ? 'xl' : 'md'}
            initialsClassName={iosList ? 'text-[13px]' : undefined}
            src={imageSrc}
            name={name}
          />
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style(
              'flex-shrink text-[17px] font-inter-medium-24 tracking-[0.34px] text-gray-950',
            )}>
            {name}
          </Animated.Text>
        </Pressable>
        {!actionsInToolbar && dashboardsList.length > 0 && (
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
                <Icon icon={<SLAIcon color={isSlaMissed ? '#E13D45' : '#858585'} />} size={16} />
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
            {actionsInToolbar ? null : (
              <Pressable
                hitSlop={4}
                onPress={onToggleChatStatus}
                style={tailwind.style(
                  'flex-row items-center gap-1.5 h-8 pl-[9px] pr-3 rounded-lg bg-gray-100',
                )}>
                <Icon icon={isOpen ? <StatusResolvedIcon /> : <StatusOpenIcon />} size={16} />
                <Animated.Text
                  style={tailwind.style(
                    'text-[15px] font-inter-medium-24 tracking-[0.225px] text-gray-950',
                  )}>
                  {statusLabel}
                </Animated.Text>
              </Pressable>
            )}
          </Animated.View>
        </Animated.View>
      )}
      <Sheet ref={slaEventsSheetRef} detents={[0.36]}>
        <SlaEvents slaEvents={slaEvents} statusText={statusText ?? ''} />
      </Sheet>
    </Animated.View>
  );
};
