import { MESSAGE_TYPES, MESSAGE_STATUS, SENDER_TYPES } from '@/constants';
import { SendMessagePayload } from '@/store/conversation/conversationTypes';
import type { PendingMessage, MessageBuilderPayload } from '@/store/conversation/conversationTypes';
import type { Message } from '@/types';
import { hasOneDayPassed } from './dateTimeUtils';

export const getUuid = () =>
  'xxxxxxxx4xxx'.replace(/[xy]/g, c => {
    // eslint-disable-next-line no-bitwise
    const r = (Math.random() * 16) | 0;
    // eslint-disable-next-line no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

export const createPendingMessage = (data: SendMessagePayload): PendingMessage => {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  const tempMessageId = getUuid();

  const { message, file, sender } = data;
  const tempAttachments = [{ id: tempMessageId }];
  const pendingMessage = {
    ...data,
    content: message || null,
    id: tempMessageId,
    echoId: tempMessageId,
    status: MESSAGE_STATUS.PROGRESS,
    createdAt: timestamp,
    messageType: MESSAGE_TYPES.OUTGOING,
    attachments: file ? tempAttachments : null,
    // The sender in the payload has no type, so the message cannot be attributed to the current
    // user once it leaves the progress state. Stamp it here so a failed message stays on the right.
    senderId: sender?.id,
    senderType: SENDER_TYPES.USER,
  };

  return pendingMessage;
};

/**
 * A failed message falls into one of two cases:
 * 1. It failed in the app itself (large attachment, no network). The message never reached the
 *    server, so it has no external error and has to be created again.
 * 2. It reached the server but the channel failed to deliver it (user blocked the account, provider
 *    outage). It has an external error and is retried through the retry endpoint.
 */
export const hasMessageFailedWithExternalError = (message: Message | PendingMessage): boolean => {
  const { status } = message;
  const externalError = (message as Message).contentAttributes?.externalError ?? '';
  return status === MESSAGE_STATUS.FAILED && externalError !== '';
};

export const canRetryMessage = (message: Message): boolean => {
  const { status, content, attachments, createdAt } = message;
  if (status !== MESSAGE_STATUS.FAILED) {
    return false;
  }
  const hasContent = content !== null && content !== undefined && content !== '';
  const hasAttachments = !!(attachments && attachments.length > 0);
  return !hasOneDayPassed(createdAt) && (hasContent || hasAttachments);
};

export const buildCreatePayload = (data: PendingMessage): MessageBuilderPayload => {
  let payload;
  const {
    message,
    file,
    private: isPrivate,
    echoId,
    ccEmails,
    bccEmails,
    contentAttributes,
    templateParams,
    toEmails,
  } = data;
  if (file) {
    payload = new FormData();
    if (message) {
      payload.append('content', message);
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    payload.append('attachments[]', {
      uri: file.uri,
      name: file.fileName,
      type: file.type,
    });
    payload.append('private', isPrivate.toString());
    payload.append('echo_id', echoId);
    payload.append('cc_emails', ccEmails || '');
    payload.append('bcc_emails', bccEmails || '');

    if (toEmails) {
      payload.append('to_emails', toEmails);
    }
    if (contentAttributes) {
      const { inReplyTo, ...rest } = contentAttributes;
      payload.append(
        'content_attributes',
        JSON.stringify({ ...rest, ...(inReplyTo ? { in_reply_to: inReplyTo } : {}) }),
      );
    }
  } else {
    const { inReplyTo, ...restAttributes } = contentAttributes || {};
    payload = {
      content: message,
      private: isPrivate,
      echo_id: echoId,
      content_attributes: {
        ...restAttributes,
        ...(inReplyTo ? { in_reply_to: inReplyTo } : {}),
      },
      cc_emails: ccEmails,
      bcc_emails: bccEmails,
      template_params: templateParams,
    };
  }
  return payload;
};
