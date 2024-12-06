import { Agent } from './Agent';
import { AgentBot } from './AgentBot';
import { UnixTimestamp } from './common';
import { Contact } from './Contact';
import { Conversation } from './Conversation';
import { User } from './User';

export type ContentType =
  | 'text'
  | 'input_text'
  | 'input_textarea'
  | 'input_email'
  | 'input_select'
  | 'cards'
  | 'form'
  | 'article'
  | 'incoming_email'
  | 'input_csat'
  | 'integrations';

export enum MessageType {
  'incoming',
  'outgoing',
  'activity',
  'template',
}

export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

type ImageMetadata = {
  id: number;
  messageId: number;
  fileType: 'image' | 'video' | 'audio' | 'file';
  accountId: number;
  extension: string | null;
  dataUrl: string;
  thumbUrl: string;
  fallbackTitle: string;
  coordinatesLat: number;
  coordinatesLong: number;
};

export type MessageContentAttributes = {
  inReplyTo: number;
  inReplyToExternalId: null;
  deleted?: boolean;
  email: {
    subject: string;
  };
  externalError: string;
  imageType: string;
};

export interface Message {
  id: number;
  attachments: ImageMetadata[];
  content: string;
  contentAttributes?: MessageContentAttributes | null;
  contentType: ContentType;
  conversationId: number;
  createdAt: UnixTimestamp;
  echoId: number | string | null;
  inboxId: number;
  messageType: MessageType;
  private: boolean;
  sender?: Agent | User | AgentBot | Contact | null;
  sourceId: string | null;
  status: MessageStatus;
  lastNonActivityMessage: Message | null;
  conversation?: Conversation | null;
  shouldRenderAvatar?: boolean | false;
}
