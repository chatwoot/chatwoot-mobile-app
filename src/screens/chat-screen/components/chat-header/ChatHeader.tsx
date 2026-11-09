import { useTailwind } from '@/theme/useTailwind';
import React, { useMemo } from 'react';
import { ImageSourcePropType, Keyboard, Platform, Pressable, StyleSheet } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useSlaPillVisibility } from '../../SlaPillVisibility';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { Avatar, Icon } from '@/components-next';
import {
  ChevronLeft,
  CheckCircleIcon,
  CloseIcon,
  InfoCircleIcon,
  ReopenCircleIcon,
  Overflow,
  PhoneOutlineIcon,
  SLAIcon,
  StatusOpenIcon,
  StatusResolvedIcon,
} from '@/svg-icons';
import { Sheet } from '@/components-next/common/sheet/Sheet';
import i18n from '@/i18n';
import { ChatDropdownMenu, DashboardList } from './DropdownMenu';
import { SLAEvent } from '@/types/common';
import { useRefsContext } from '@/context';
import { SlaEvents } from './SlaEvents';
import { IOS_DESIGN, useIOSListText, useSideTabBarLayout } from '@/utils';
import { useIsInDetailPane, useSplitView } from '@/navigation/split/SplitViewContext';
import { useSideToolbar } from '@/context';
import { SideToolbarButton } from '@/components-next/side-toolbar';
import { GlassCircleButton } from '@/components-next/side-toolbar/GlassCircleButton';
import { usePaneRightInset } from '@/navigation/split/usePaneRightInset';
import { useIsColumnOpen } from '@/navigation/split/columnOpenStore';

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
  slaTime?: string;
  showCallButton?: boolean;
  isCallDisabled?: boolean;
  onCallPress?: () => void;
  onBackPress: () => void;
  onContactDetailsPress: () => void;
  onToggleChatStatus: () => void;
  onOpenActions?: () => void;
};

const TOOLBAR_STROKE = 1.5;

const useLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

const FloatingSlaPill = ({
  label,
  isMissed,
  onPress,
}: {
  label: string;
  isMissed: boolean;
  onPress: () => void;
}) => {
  const tailwind = useTailwind();
  const visibility = useSlaPillVisibility();
  const style = useAnimatedStyle(() => {
    const shown = visibility ? visibility.value : 1;
    return { opacity: shown, transform: [{ translateY: (1 - shown) * -12 }] };
  });
  return (
    <Animated.View
      pointerEvents="box-none"
      style={[tailwind.style('absolute left-0 right-0 top-full mt-2 items-center'), style]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) =>
          tailwind.style(
            'flex-row items-center gap-1.5 h-8 pl-2.5 pr-3 rounded-full',
            useLiquidGlass ? '' : 'bg-white border-[0.5px] border-blackA-A6',
            pressed && 'opacity-70',
          )
        }>
        {useLiquidGlass ? (
          <GlassView
            colorScheme={tailwind.isDark ? 'dark' : 'light'}
            glassEffectStyle="regular"
            isInteractive
            style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
          />
        ) : null}
        <Icon icon={<SLAIcon color={isMissed ? '#E13D45' : '#858585'} />} size={14} />
        <Animated.Text
          style={tailwind.style(
            'text-[13px] leading-[18px] font-inter-medium-24',
            isMissed ? 'text-ruby-800' : 'text-gray-950',
          )}>
          {label}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
};

const SLA_SHEET_SIZE = IOS_DESIGN
  ? { autoSize: true, maxWidth: 440 }
  : { detents: [0.36], maxWidth: 440 };

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
  showCallButton = false,
  isCallDisabled = false,
  onCallPress,
  onBackPress,
  onContactDetailsPress,
  onToggleChatStatus,
  onOpenActions,
}: ChatHeaderProps) => {
  const tailwind = useTailwind();
  const iosList = useIOSListText();
  const { slaEventsSheetRef } = useRefsContext();

  const isInPane = useIsInDetailPane();
  const sideTabBar = useSideTabBarLayout();
  const hasSideToolbar = isInPane || sideTabBar !== null;
  const paneRightInset = usePaneRightInset();
  const statusLabel = isOpen
    ? i18n.t('CONVERSATION.RESOLVE')
    : isResolved
      ? i18n.t('CONVERSATION.REOPEN')
      : i18n.t('CONVERSATION.OPEN');
  const { chatPagerView } = useRefsContext();
  const isOnActionsPage = !showDetailsRow;
  const paneMenuList = useMemo(() => dashboardsList.filter(item => !!item.url), [dashboardsList]);
  const splitView = useSplitView();
  const isColumnOpen = useIsColumnOpen();
  const isContactOpen = isColumnOpen ?? !!splitView?.isSecondaryOpen;
  const toolbarItems = useMemo(
    () =>
      isContactOpen ? (
        <SideToolbarButton
          icon={
            <ChevronLeft stroke={tailwind.color('text-gray-950')} strokeWidth={TOOLBAR_STROKE} />
          }
          iconSize={24}
          onPress={() => splitView?.closeSecondary()}
          accessibilityLabel={i18n.t('CONVERSATION.HEADER.BACK')}
        />
      ) : isOnActionsPage ? (
        <SideToolbarButton
          icon={
            <ChevronLeft stroke={tailwind.color('text-gray-950')} strokeWidth={TOOLBAR_STROKE} />
          }
          iconSize={24}
          onPress={() => chatPagerView.current?.setPage(0)}
          accessibilityLabel={i18n.t('CONVERSATION.HEADER.BACK_TO_MESSAGES')}
        />
      ) : (
        <>
          {isInPane ? (
            <SideToolbarButton
              icon={<CloseIcon stroke={tailwind.color('text-gray-950')} strokeWidth={1.2} />}
              iconSize={28}
              onPress={onBackPress}
              accessibilityLabel={i18n.t('CONVERSATION.HEADER.CLOSE')}
            />
          ) : (
            <SideToolbarButton
              icon={
                <ChevronLeft
                  stroke={tailwind.color('text-gray-950')}
                  strokeWidth={TOOLBAR_STROKE}
                />
              }
              iconSize={24}
              onPress={onBackPress}
              accessibilityLabel={i18n.t('CONVERSATION.HEADER.BACK')}
            />
          )}
          {showCallButton ? (
            <SideToolbarButton
              icon={
                <PhoneOutlineIcon
                  stroke={tailwind.color('text-gray-950')}
                  strokeWidth={TOOLBAR_STROKE}
                />
              }
              iconSize={24}
              onPress={onCallPress}
              disabled={isCallDisabled}
              accessibilityLabel={i18n.t('CONTACT_DETAILS.CALL')}
            />
          ) : null}
          <SideToolbarButton
            icon={
              isOpen ? (
                <CheckCircleIcon
                  stroke={tailwind.color('text-gray-950')}
                  strokeWidth={TOOLBAR_STROKE}
                />
              ) : (
                <ReopenCircleIcon
                  stroke={tailwind.color('text-gray-950')}
                  strokeWidth={TOOLBAR_STROKE}
                />
              )
            }
            iconSize={24}
            onPress={onToggleChatStatus}
            accessibilityLabel={statusLabel}
          />
          {onOpenActions ? (
            <SideToolbarButton
              icon={
                <InfoCircleIcon
                  stroke={tailwind.color('text-gray-950')}
                  strokeWidth={TOOLBAR_STROKE}
                />
              }
              iconSize={24}
              onPress={onOpenActions}
              accessibilityLabel={i18n.t('CONVERSATION_ACTION.TITLE')}
            />
          ) : null}
          {paneMenuList.length > 0 ? (
            <ChatDropdownMenu dropdownMenuList={paneMenuList} plainTrigger>
              <SideToolbarButton
                icon={<Overflow stroke={tailwind.color('text-gray-950')} strokeWidth={1.3} />}
                iconSize={26}
                accessibilityLabel={i18n.t('CONVERSATION.HEADER.MORE')}
              />
            </ChatDropdownMenu>
          ) : null}
        </>
      ),
    [
      isContactOpen,
      splitView,
      isOnActionsPage,
      chatPagerView,
      isInPane,
      onBackPress,
      showCallButton,
      onCallPress,
      isCallDisabled,
      isOpen,
      onToggleChatStatus,
      statusLabel,
      onOpenActions,
      paneMenuList,
      tailwind,
    ],
  );
  const actionsInToolbar = useSideToolbar(toolbarItems, hasSideToolbar) && hasSideToolbar;

  const toggleSlaEventsSheet = () => {
    Keyboard.dismiss();
    slaEventsSheetRef.current?.present();
  };

  if (actionsInToolbar) {
    return (
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
            <Avatar size="xl" initialsClassName="text-[11px]" src={imageSrc} name={name} />
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
                  <Animated.Text
                    numberOfLines={1}
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
        <Sheet ref={slaEventsSheetRef} {...SLA_SHEET_SIZE}>
          <SlaEvents slaEvents={slaEvents} statusText={statusText ?? ''} isMissed={isSlaMissed} />
        </Sheet>
      </Animated.View>
    );
  }

  if (IOS_DESIGN) {
    const slaLabel = hasSla && slaType ? (slaTime ? `${slaType}: ${slaTime}` : slaType) : null;
    return (
      <Animated.View style={tailwind.style('z-10')}>
        <Animated.View style={tailwind.style('flex-row items-center gap-2 px-4 pt-1 pb-3')}>
          <GlassCircleButton
            icon={
              <ChevronLeft stroke={tailwind.color('text-gray-950')} strokeWidth={TOOLBAR_STROKE} />
            }
            onPress={isOnActionsPage ? () => chatPagerView.current?.setPage(0) : onBackPress}
            accessibilityLabel={i18n.t(
              isOnActionsPage ? 'CONVERSATION.HEADER.BACK_TO_MESSAGES' : 'CONVERSATION.HEADER.BACK',
            )}
          />
          <Pressable
            onPress={onContactDetailsPress}
            accessibilityRole="button"
            style={[tailwind.style('flex-1 flex-row items-center gap-2.5 ml-1')]}>
            <Avatar size="xl" initialsClassName="text-[11px]" src={imageSrc} name={name} />
            <Animated.View style={tailwind.style('flex-1')}>
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
                  {inboxName ? (
                    <Animated.Text
                      numberOfLines={1}
                      style={tailwind.style(
                        'flex-shrink text-[13px] leading-[18px] font-inter-normal-20 text-gray-700',
                      )}>
                      {inboxName}
                    </Animated.Text>
                  ) : null}
                </Animated.View>
              ) : null}
            </Animated.View>
          </Pressable>
          {isOnActionsPage ? null : (
            <>
              {showCallButton ? (
                <GlassCircleButton
                  icon={
                    <PhoneOutlineIcon
                      stroke={tailwind.color('text-gray-950')}
                      strokeWidth={TOOLBAR_STROKE}
                    />
                  }
                  iconSize={22}
                  onPress={onCallPress}
                  disabled={isCallDisabled}
                  accessibilityLabel={i18n.t('CONTACT_DETAILS.CALL')}
                />
              ) : null}
              <GlassCircleButton
                icon={
                  isOpen ? (
                    <CheckCircleIcon
                      stroke={tailwind.color('text-gray-950')}
                      strokeWidth={TOOLBAR_STROKE}
                    />
                  ) : (
                    <ReopenCircleIcon
                      stroke={tailwind.color('text-gray-950')}
                      strokeWidth={TOOLBAR_STROKE}
                    />
                  )
                }
                iconSize={22}
                onPress={onToggleChatStatus}
                accessibilityLabel={statusLabel}
              />
              {paneMenuList.length === 0 && onOpenActions ? (
                <GlassCircleButton
                  icon={
                    <InfoCircleIcon
                      stroke={tailwind.color('text-gray-950')}
                      strokeWidth={TOOLBAR_STROKE}
                    />
                  }
                  iconSize={22}
                  onPress={onOpenActions}
                  accessibilityLabel={i18n.t('CONVERSATION_ACTION.TITLE')}
                />
              ) : null}
              {paneMenuList.length > 0 ? (
                <ChatDropdownMenu dropdownMenuList={dashboardsList} plainTrigger>
                  <GlassCircleButton
                    icon={<Overflow stroke={tailwind.color('text-gray-950')} strokeWidth={1.3} />}
                    iconSize={22}
                    accessibilityLabel={i18n.t('CONVERSATION.HEADER.MORE')}
                  />
                </ChatDropdownMenu>
              ) : null}
            </>
          )}
        </Animated.View>
        {slaLabel && !isOnActionsPage ? (
          <FloatingSlaPill
            label={slaLabel}
            isMissed={!!isSlaMissed}
            onPress={toggleSlaEventsSheet}
          />
        ) : null}
        <Sheet ref={slaEventsSheetRef} {...SLA_SHEET_SIZE}>
          <SlaEvents slaEvents={slaEvents} statusText={statusText ?? ''} isMissed={isSlaMissed} />
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
          <Avatar
            size={iosList ? 'xl' : 'md'}
            initialsClassName={iosList ? 'text-[11px]' : undefined}
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
        {showCallButton && (
          <Pressable
            hitSlop={8}
            disabled={isCallDisabled}
            accessibilityRole="button"
            onPress={onCallPress}
            style={tailwind.style(
              'h-8 w-8 items-center justify-center',
              isCallDisabled ? 'opacity-40' : '',
            )}>
            <Icon
              icon={
                <PhoneOutlineIcon
                  stroke={tailwind.color('text-gray-950')}
                  strokeWidth={TOOLBAR_STROKE}
                />
              }
              size={24}
            />
          </Pressable>
        )}
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
      <Sheet ref={slaEventsSheetRef} {...SLA_SHEET_SIZE}>
        <SlaEvents slaEvents={slaEvents} statusText={statusText ?? ''} isMissed={isSlaMissed} />
      </Sheet>
    </Animated.View>
  );
};
