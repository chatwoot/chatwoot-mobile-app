import { MESSAGE_TYPES, MESSAGE_STATUS } from '@/constants';
import { SendMessagePayload } from '@/store/conversation/conversationTypes';
import type { PendingMessage, MessageBuilderPayload } from '@/store/conversation/conversationTypes';

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

  const { message, file } = data;
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
  };

  return pendingMessage;
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
      payload.append('content_attributes', JSON.stringify(contentAttributes));
    }
  } else {
    payload = {
      content: message,
      private: isPrivate,
      echo_id: echoId,
      content_attributes: {
        ...contentAttributes,
        in_reply_to: contentAttributes?.inReplyTo,
      },
      cc_emails: ccEmails,
      bcc_emails: bccEmails,
      template_params: templateParams,
    };
  }
  return payload;
};
