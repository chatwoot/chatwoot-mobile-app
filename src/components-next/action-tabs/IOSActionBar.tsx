import React from 'react';
import { Pressable, View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';
import { conversationActions } from '@/store/conversation/conversationActions';
import { setCurrentState } from '@/store/conversation/conversationHeaderSlice';
import { selectSelectedIds } from '@/store/conversation/conversationSelectedSlice';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import { ConversationStatus, StatusOptions } from '@/types';
import { CheckCircleIcon, PersonCircleGlyph, TagGlyph } from '@/svg-icons';
import i18n from '@/i18n';

import { tailwind } from '@/theme';
import { useHaptic } from '@/utils';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { ToolbarButton } from './ToolbarButton';
import { ACTION_TAB_HEIGHT, IOS_BAR_WIDTH } from './actionTabsLayout';
import { ActionTabBarBackground } from './ActionTabBarBackground';

// zeego Label types include web props.
const MenuLabel = DropdownMenu.Label as unknown as React.FC<{ children: string }>;

const STATUS_OPTIONS: { id: ConversationStatus; icon: string }[] = [
  { id: 'open', icon: 'tray' },
  { id: 'pending', icon: 'clock' },
  { id: 'snoozed', icon: 'moon' },
  { id: 'resolved', icon: 'checkmark.circle' },
];

export const IOSActionBar = ({ barLeft, bottom }: { barLeft: number; bottom: number }) => {
  const dispatch = useAppDispatch();
  const haptic = useHaptic();
  const selectedIds = useAppSelector(selectSelectedIds);
  const hasSelection = selectedIds.length > 0;

  const bulk = (payload: Record<string, unknown>) => {
    haptic?.();
    dispatch(
      conversationActions.bulkAction({ type: 'Conversation', ids: selectedIds, ...payload }),
    );
  };
  const navigation = useNavigation<NativeStackNavigationProp<TabBarExcludedScreenParamList>>();
  const openPicker = (kind: 'assign' | 'label') => {
    haptic?.();
    navigation.navigate('BulkPicker', { kind });
  };
  const setStatus = (status: ConversationStatus) => {
    bulk({ fields: { status } });
    dispatch(setCurrentState('none'));
  };

  const menu = (button: React.ReactElement, content: React.ReactNode) =>
    hasSelection ? (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <View>{button}</View>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>{content}</DropdownMenu.Content>
      </DropdownMenu.Root>
    ) : (
      button
    );

  return (
    <ActionTabBarBackground
      glass
      style={[
        tailwind.style(
          'absolute flex-row items-center justify-around rounded-full px-2',
          `h-[${ACTION_TAB_HEIGHT}px] w-[${IOS_BAR_WIDTH}px]`,
        ),
        { bottom, left: barLeft },
      ]}>
      <Pressable
        disabled={!hasSelection}
        onPress={() => openPicker('label')}
        style={({ pressed }) => tailwind.style('rounded-full', pressed && 'bg-blackA-A3')}>
        <ToolbarButton
          label={i18n.t('CONVERSATION.BULK.LABEL')}
          glyph={TagGlyph}
          enabled={hasSelection}
        />
      </Pressable>
      <Pressable
        disabled={!hasSelection}
        onPress={() => openPicker('assign')}
        style={({ pressed }) => tailwind.style('rounded-full', pressed && 'bg-blackA-A3')}>
        <ToolbarButton
          label={i18n.t('CONVERSATION.BULK.ASSIGN')}
          glyph={PersonCircleGlyph}
          enabled={hasSelection}
        />
      </Pressable>
      {menu(
        <ToolbarButton
          label={i18n.t('CONVERSATION.BULK.STATUS')}
          glyph={CheckCircleIcon}
          enabled={hasSelection}
        />,
        <DropdownMenu.Group>
          <MenuLabel>{i18n.t('CONVERSATION.CHANGE_STATUS')}</MenuLabel>
          {STATUS_OPTIONS.map(option => (
            <DropdownMenu.Item key={`status-${option.id}`} onSelect={() => setStatus(option.id)}>
              <DropdownMenu.ItemIcon ios={{ name: option.icon as never }} />
              <DropdownMenu.ItemTitle>
                {i18n.t(
                  `CONVERSATION.ASSIGNEE.STATUS.OPTIONS.${StatusOptions[option.id].toUpperCase()}`,
                )}
              </DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Group>,
      )}
    </ActionTabBarBackground>
  );
};
