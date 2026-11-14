import { PropsWithChildren } from 'react';
import { View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { useChatWindowContext, useRefsContext } from '@/context';
import { useAppDispatch, useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import { isAWhatsAppChannel, useHaptic } from '@/utils';
import { useSplitView } from '@/navigation/split/SplitViewContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';

import {
  handleAttachFile,
  handleLaunchCamera,
  handleOpenPhotosLibrary,
} from '../message-components/CommandOptionsMenu';
import { renderItem, type MenuItemSpec } from './replyMenuItem';

export const AddAttachmentMenu = ({ children }: PropsWithChildren) => {
  const dispatch = useAppDispatch();
  const haptic = useHaptic();
  const { whatsAppTemplatesSheetRef } = useRefsContext();
  const splitView = useSplitView();
  const navigation = useNavigation<NativeStackNavigationProp<TabBarExcludedScreenParamList>>();
  const { conversationId } = useChatWindowContext();
  const conversation = useAppSelector(state => selectConversationById(state, conversationId));
  const inboxId = conversation?.inboxId;
  const inbox = useAppSelector(state => (inboxId ? selectInboxById(state, inboxId) : undefined));

  const items: MenuItemSpec[] = [
    {
      key: 'photos',
      title: i18n.t('CONVERSATION_ATTACHMENT.OPTIONS.PHOTOS'),
      icon: 'photo.on.rectangle',
      onSelect: () => handleOpenPhotosLibrary(dispatch),
    },
    {
      key: 'camera',
      title: i18n.t('CONVERSATION_ATTACHMENT.OPTIONS.CAMERA'),
      icon: 'camera',
      onSelect: () => handleLaunchCamera(dispatch),
    },
    {
      key: 'attach_file',
      title: i18n.t('CONVERSATION_ATTACHMENT.OPTIONS.ATTACH_FILE'),
      icon: 'paperclip',
      onSelect: () => handleAttachFile(dispatch),
    },
  ];
  const tools: MenuItemSpec[] = [
    {
      key: 'macros',
      title: i18n.t('CONVERSATION_ATTACHMENT.OPTIONS.MACROS'),
      icon: 'bolt',
      onSelect: () =>
        splitView
          ? splitView.openMacros()
          : navigation.navigate('MacrosScreen', { conversationId }),
    },
  ];
  if (inbox && isAWhatsAppChannel(inbox)) {
    tools.push({
      key: 'whatsapp_templates',
      title: i18n.t('CONVERSATION_ATTACHMENT.OPTIONS.WHATSAPP_TEMPLATES'),
      icon: 'doc.text',
      onSelect: () => whatsAppTemplatesSheetRef.current?.present(),
    });
  }

  return (
    <DropdownMenu.Root onOpenChange={open => open && haptic?.()}>
      <DropdownMenu.Trigger asChild>
        <View accessibilityRole="button">{children}</View>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Group>{items.map(renderItem)}</DropdownMenu.Group>
        <DropdownMenu.Group>{tools.map(renderItem)}</DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
