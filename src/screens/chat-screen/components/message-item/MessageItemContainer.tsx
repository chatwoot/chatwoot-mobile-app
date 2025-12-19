import React, { useState } from 'react';
import { Message } from '@/types';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { selectLocale } from '@/store/settings/settingsSelectors';
import { useChatWindowContext } from '@/context';
import { conversationActions } from '@/store/conversation/conversationActions';
import { useHaptic } from '@/utils';
import { showToast } from '@/utils/toastUtils';
import i18n from '@/i18n';
import Clipboard from '@react-native-clipboard/clipboard';
import { MESSAGE_TYPES } from '@/constants';
import { CopyIcon, Trash, TranslateIcon } from '@/svg-icons';
import { MenuOption } from '../message-menu';
import { MessageItem } from './MessageItem';

type MessageItemContainerProps = {
  item: { date: string } | Message;
  index: number;
};

export const MessageItemContainer = (props: MessageItemContainerProps) => {
  const dispatch = useAppDispatch();
  const { conversationId } = useChatWindowContext();

  const hapticSelection = useHaptic();
  const conversation = useAppSelector(state => selectConversationById(state, conversationId));
  const locale = useAppSelector(selectLocale);
  const [translatingMessageId, setTranslatingMessageId] = useState<number | null>(null);

  const handleCopyMessage = (content: string) => {
    hapticSelection?.();
    if (content) {
      Clipboard.setString(content);
      showToast({ message: i18n.t('CONVERSATION.COPY_MESSAGE') });
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    await dispatch(conversationActions.deleteMessage({ conversationId, messageId }));
    showToast({ message: i18n.t('CONVERSATION.DELETE_MESSAGE_SUCCESS') });
  };

  const handleTranslateMessage = async (messageId: number) => {
    hapticSelection?.();
    setTranslatingMessageId(messageId);
    try {
      await dispatch(
        conversationActions.translateMessage({
          conversationId,
          messageId,
          targetLanguage: locale || 'en',
        }),
      ).unwrap();
      showToast({ message: i18n.t('CONVERSATION.TRANSLATE_MESSAGE_SUCCESS') });
    } catch {
      showToast({ message: i18n.t('CONVERSATION.TRANSLATE_MESSAGE_ERROR') });
    } finally {
      setTranslatingMessageId(null);
    }
  };

  const getMenuOptions = (message: Message): MenuOption[] => {
    const { messageType, content, attachments } = message;
    const hasText = !!content;
    const hasAttachments = !!(attachments && attachments.length > 0);
    const isDeleted = message.contentAttributes?.deleted;

    const menuOptions: MenuOption[] = [];
    if (messageType === MESSAGE_TYPES.ACTIVITY || isDeleted) {
      return [];
    }

    const hasTranslations =
      message.contentAttributes?.translations &&
      Object.keys(message.contentAttributes.translations).length > 0;
    const isTranslating = translatingMessageId === message.id;

    if (hasText) {
      menuOptions.push({
        title: i18n.t('CONVERSATION.LONG_PRESS_ACTIONS.COPY'),
        icon: <CopyIcon />,
        handleOnPressMenuOption: () => handleCopyMessage(content),
        destructive: false,
      });
      if (!hasTranslations && !isTranslating) {
        menuOptions.push({
          title: i18n.t('CONVERSATION.LONG_PRESS_ACTIONS.TRANSLATE'),
          icon: <TranslateIcon />,
          handleOnPressMenuOption: () => handleTranslateMessage(message.id),
          destructive: false,
        });
      }
    }

    if (hasAttachments || hasText) {
      menuOptions.push({
        title: i18n.t('CONVERSATION.LONG_PRESS_ACTIONS.DELETE_MESSAGE'),
        icon: <Trash />,
        handleOnPressMenuOption: () => handleDeleteMessage(message.id),
        destructive: true,
      });
    }

    return menuOptions;
  };

  return (
    <MessageItem
      item={props.item}
      channel={conversation?.channel || conversation?.meta?.channel}
      getMenuOptions={getMenuOptions}
    />
  );
};
