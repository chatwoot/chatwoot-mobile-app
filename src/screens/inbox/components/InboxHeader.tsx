import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { Sheet } from '@/components-next/common/sheet/Sheet';
import { Icon } from '@/components-next/common/icon';
import { DoubleCheckIcon, InboxFilterIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { IOS_DESIGN, useIsSplitLayout, useSideTabBarLayout } from '@/utils';
import { InboxFilters } from './InboxFilters';
import { InboxSortMenu, useIsInboxSortChanged } from './InboxSortMenu';
import i18n from '@/i18n';
import { useRefsContext, useSideToolbar } from '@/context';
import {
  GlassCircleButton,
  HEADER_ICON_COLOR,
  LargeHeaderTitle,
  SideToolbarButton,
} from '@/components-next/side-toolbar';

type InboxHeaderProps = {
  markAllAsRead: () => void;
};

export const InboxHeader = (props: InboxHeaderProps) => {
  const { markAllAsRead } = props;
  const { inboxFiltersSheetRef } = useRefsContext();
  const handleToggleState = () => {
    inboxFiltersSheetRef.current?.present();
  };

  // With tabs on the side (iPhone Duo), the header actions move to the side toolbar. In
  // the split view they stay above the list, next to the content they affect.
  const isSplit = useIsSplitLayout();
  const isSortChanged = useIsInboxSortChanged();
  const sideTabBar = useSideTabBarLayout();
  const actionItems = (
    <>
      <SideToolbarButton
        icon={<DoubleCheckIcon stroke={HEADER_ICON_COLOR} />}
        onPress={markAllAsRead}
        accessibilityLabel={i18n.t('NOTIFICATION.MARK_ALL')}
      />
      {/* Native sort menu (iOS pull-down) instead of the bottom sheet. */}
      <InboxSortMenu>
        <SideToolbarButton
          icon={<InboxFilterIcon stroke={HEADER_ICON_COLOR} />}
          showBadge={isSortChanged}
          accessibilityLabel={i18n.t('CONVERSATION.FILTERS.SORT_BY.TITLE')}
        />
      </InboxSortMenu>
    </>
  );
  const isSideLayout = useSideToolbar(actionItems, [markAllAsRead, isSortChanged], !isSplit);

  return (
    <Animated.View
      style={[
        // On iOS (and with tabs on the side) the header floats over the list and the scroll
        // edge effect separates it, so it has no divider of its own.
        IOS_DESIGN || sideTabBar ? null : tailwind.style('border-b-[1px] border-b-blackA-A3'),
        // Keep header controls out of the rounded corner when the status bar is on the side.
        { paddingTop: sideTabBar?.contentTopPadding ?? 0 },
      ]}>
      {isSplit || (IOS_DESIGN && !isSideLayout) ? (
        // Split view and iPhone: small centered title with round glass buttons.
        <Animated.View style={tailwind.style('flex flex-row items-center px-4 pt-1 pb-3')}>
          <Animated.View style={tailwind.style('w-24 flex-row items-center')}>
            <GlassCircleButton
              icon={<DoubleCheckIcon stroke={HEADER_ICON_COLOR} />}
              onPress={markAllAsRead}
              accessibilityLabel={i18n.t('NOTIFICATION.MARK_ALL')}
            />
          </Animated.View>
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style(
              'flex-1 text-[17px] text-center leading-[22px] tracking-[0.32px] font-inter-medium-24 text-gray-950',
            )}>
            {i18n.t('NOTIFICATION.INBOX')}
          </Animated.Text>
          <Animated.View style={tailwind.style('w-24 flex-row items-center justify-end')}>
            {/* Native sort menu (iOS pull-down) instead of the bottom sheet. */}
            <InboxSortMenu>
              <GlassCircleButton
                icon={<InboxFilterIcon stroke={HEADER_ICON_COLOR} />}
                showBadge={isSortChanged}
                accessibilityLabel={i18n.t('CONVERSATION.FILTERS.SORT_BY.TITLE')}
              />
            </InboxSortMenu>
          </Animated.View>
        </Animated.View>
      ) : isSideLayout ? (
        <Animated.View style={tailwind.style('flex flex-row items-center px-4 pt-2 pb-3')}>
          <LargeHeaderTitle title={i18n.t('NOTIFICATION.INBOX')} />
        </Animated.View>
      ) : (
        <Animated.View
          style={[
            tailwind.style('flex flex-row justify-between items-center px-4 pt-2 pb-[12px]'),
          ]}>
          <Animated.View style={tailwind.style('flex-1')}>
            <Pressable hitSlop={16} onPress={markAllAsRead}>
              <Icon icon={<DoubleCheckIcon />} size={24} />
            </Pressable>
          </Animated.View>
          <Animated.View style={tailwind.style('flex-1')}>
            <Animated.Text
              style={tailwind.style(
                'text-[17px] text-center leading-[17px] tracking-[0.32px] font-inter-medium-24 text-gray-950',
              )}>
              {i18n.t('NOTIFICATION.INBOX')}
            </Animated.Text>
          </Animated.View>
          <Animated.View style={tailwind.style('flex-1 items-end')}>
            <Pressable onPress={handleToggleState} hitSlop={16}>
              <Icon icon={<InboxFilterIcon />} size={24} />
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}
      <Sheet ref={inboxFiltersSheetRef} height={160}>
        <InboxFilters />
      </Sheet>
    </Animated.View>
  );
};
