import React from 'react';
import { Message } from '@/types';
import { Inbox } from '@/types/Inbox';
import { MESSAGE_STATUS, MESSAGE_TYPES } from '@/constants';
import { CopyIcon, ReplyIcon, ShareIcon } from '@/svg-icons/menu-icons';
import { TranslateIcon } from '@/svg-icons/list-icons/Translate';
import { Trash } from '@/svg-icons/common/Trash';
import { inboxSupportsReplyTo } from '@/utils/inboxUtils';
import i18n from '@/i18n';
import { MenuOption } from '../message-menu';

export interface BuildMessageMenuOptionsParams {
  message: Message;
  inbox?: Inbox;
  targetLanguage?: string;
  onCopyText?: (content: string) => void;
  onTranslate?: (messageId: number) => void;
  onShareMedia?: (dataUrl: string) => void;
  onReply?: (message: Message) => void;
  onDelete?: (messageId: number) => void;
}

export const buildMessageMenuOptions = ({
  message,
  inbox,
  targetLanguage,
  onCopyText,
  onTranslate,
  onShareMedia,
  onReply,
  onDelete,
}: BuildMessageMenuOptionsParams): MenuOption[] => {
  const { messageType, content, attachments, private: isPrivate, status: messageStatus } = message;

  const hasText = !!content;
  const hasAttachments = !!(attachments && attachments.length > 0);
  const validAttachments = attachments?.filter(a => !!a.dataUrl) || [];
  const hasValidAttachments = validAttachments.length > 0;
  const isDeleted = message.contentAttributes?.deleted;
  const isFailedOrProcessing =
    messageStatus === MESSAGE_STATUS.FAILED || messageStatus === MESSAGE_STATUS.PROGRESS;

  const menuOptions: MenuOption[] = [];
  if (messageType === MESSAGE_TYPES.ACTIVITY || isDeleted) {
    return [];
  }

  if (hasText) {
    menuOptions.push({
      title: i18n.t('CONVERSATION.LONG_PRESS_ACTIONS.COPY'),
      icon: <CopyIcon />,
      handleOnPressMenuOption: () => onCopyText?.(content),
      destructive: false,
    });

    const lang = targetLanguage || i18n.locale?.split('_')[0] || 'en';
    const hasTranslationForLocale = !!message.contentAttributes?.translations?.[lang];
    if (!hasTranslationForLocale) {
      menuOptions.push({
        title: i18n.t('CONVERSATION.LONG_PRESS_ACTIONS.TRANSLATE'),
        icon: <TranslateIcon />,
        handleOnPressMenuOption: () => onTranslate?.(message.id),
        destructive: false,
      });
    }
  }

  if (hasValidAttachments) {
    validAttachments.forEach((attachment, index) => {
      let titleKey = 'SHARE_FILE';
      if (attachment.fileType === 'image') {
        titleKey = 'SHARE_IMAGE';
      } else if (attachment.fileType === 'video' || attachment.fileType === 'ig_reel') {
        titleKey = 'SHARE_VIDEO';
      }

      let title = i18n.t(`CONVERSATION.LONG_PRESS_ACTIONS.${titleKey}`);
      if (validAttachments.length > 1) {
        title = `${title} (${index + 1})`;
      }

      menuOptions.push({
        title,
        icon: <ShareIcon />,
        handleOnPressMenuOption: () => onShareMedia?.(attachment.dataUrl),
        destructive: false,
      });
    });
  }

  if (!isPrivate && !isFailedOrProcessing && inboxSupportsReplyTo(inbox).outgoing) {
    menuOptions.push({
      title: i18n.t('CONVERSATION.LONG_PRESS_ACTIONS.REPLY'),
      icon: <ReplyIcon />,
      handleOnPressMenuOption: () => onReply?.(message),
      destructive: false,
    });
  }

  if (hasAttachments || hasText) {
    menuOptions.push({
      title: i18n.t('CONVERSATION.LONG_PRESS_ACTIONS.DELETE_MESSAGE'),
      icon: <Trash />,
      handleOnPressMenuOption: () => onDelete?.(message.id),
      destructive: true,
    });
  }

  return menuOptions;
};
