import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { REPLY_EDITOR_MODES } from '@/constants';
import { COPILOT_ACTIONS } from '@/constants/copilot';
import { useChatWindowContext, useRefsContext } from '@/context';
import { useAppDispatch, useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import type { CopilotActionKey } from '@/types/Copilot';
import { isAWhatsAppChannel, useHaptic } from '@/utils';
import { useSplitView } from '@/navigation/split/SplitViewContext';

import { TONE_OPTIONS } from '../copilot/ToneSelectionSheet';
import {
  handleAttachFile,
  handleLaunchCamera,
  handleOpenPhotosLibrary,
} from '../message-components/CommandOptionsMenu';

// Native iOS pull-down menus for the iPhone Duo reply bar's + and Copilot buttons (Apple
// HIG, Pull-down buttons), in place of the panels that slide up under the reply bar.
// zeego builds the native menu from its own elements, so items are written out inline.

type MenuItemSpec = { key: string; title: string; icon: string; onSelect: () => void };

const renderItem = ({ key, title, icon, onSelect }: MenuItemSpec) => (
  <DropdownMenu.Item key={key} onSelect={onSelect}>
    <DropdownMenu.ItemIcon ios={{ name: icon as never }} />
    <DropdownMenu.ItemTitle>{title}</DropdownMenu.ItemTitle>
  </DropdownMenu.Item>
);

/** Wraps the + button so tapping it opens the attachments menu. */
export const AddAttachmentMenu = ({ children }: PropsWithChildren) => {
  const dispatch = useAppDispatch();
  const haptic = useHaptic();
  const { macrosListSheetRef, whatsAppTemplatesSheetRef } = useRefsContext();
  const splitView = useSplitView();
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
      // On the Duo, macros open in the side column like Actions; otherwise the sheet.
      onSelect: () => (splitView ? splitView.openMacros() : macrosListSheetRef.current?.present()),
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

type CopilotReplyMenuProps = PropsWithChildren<{
  editorContent: string;
  editorMode: string;
  onSelectAction: (actionKey: CopilotActionKey) => void;
}>;

/** Wraps the Copilot button so tapping it opens the Copilot actions, with tones in a submenu. */
export const CopilotReplyMenu = ({
  editorContent,
  editorMode,
  onSelectAction,
  children,
}: CopilotReplyMenuProps) => {
  const haptic = useHaptic();
  const hasContent = editorContent.trim().length > 0;
  const isReplyMode = editorMode === REPLY_EDITOR_MODES.REPLY;
  const run = (key: string) => () => onSelectAction(key as CopilotActionKey);

  const rewrite: MenuItemSpec[] = hasContent
    ? [
        {
          key: 'improve',
          title: i18n.t('COPILOT.IMPROVE_REPLY'),
          icon: 'wand.and.stars',
          onSelect: run(COPILOT_ACTIONS.IMPROVE),
        },
        {
          key: 'grammar',
          title: i18n.t('COPILOT.FIX_GRAMMAR'),
          icon: 'text.badge.checkmark',
          onSelect: run(COPILOT_ACTIONS.FIX_SPELLING_GRAMMAR),
        },
      ]
    : [];
  const generate: MenuItemSpec[] = [
    ...(isReplyMode
      ? [
          {
            key: 'suggest',
            title: i18n.t('COPILOT.SUGGEST_REPLY'),
            icon: 'arrowshape.turn.up.left',
            onSelect: run(COPILOT_ACTIONS.REPLY_SUGGESTION),
          },
        ]
      : []),
    {
      key: 'summarize',
      title: i18n.t('COPILOT.SUMMARIZE'),
      icon: 'text.alignleft',
      onSelect: run(COPILOT_ACTIONS.SUMMARIZE),
    },
  ];

  return (
    <DropdownMenu.Root onOpenChange={open => open && haptic?.()}>
      <DropdownMenu.Trigger asChild>
        <View accessibilityRole="button">{children}</View>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {hasContent ? (
          <DropdownMenu.Group>
            {rewrite.map(renderItem)}
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger key="tone-trigger">
                <DropdownMenu.ItemIcon ios={{ name: 'theatermasks' as never }} />
                <DropdownMenu.ItemTitle>{i18n.t('COPILOT.CHANGE_TONE')}</DropdownMenu.ItemTitle>
              </DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                {TONE_OPTIONS.map(option => (
                  <DropdownMenu.Item key={`tone-${option.key}`} onSelect={run(option.key)}>
                    <DropdownMenu.ItemTitle>{i18n.t(option.labelKey)}</DropdownMenu.ItemTitle>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          </DropdownMenu.Group>
        ) : null}
        <DropdownMenu.Group>{generate.map(renderItem)}</DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
