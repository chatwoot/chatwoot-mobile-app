import { Agent } from './Agent';
import { AgentBot } from './AgentBot';
import { UnixTimestamp } from './common';
import { Contact } from './Contact';

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
};

export type MessageContentAttributes = {
  inReplyTo: number;
  inReplyToExternalId: null;
};

export interface Message {
  attachments: ImageMetadata[];
  content: string;
  contentAttributes: MessageContentAttributes | null;
  contentType: ContentType;
  conversationId: number;
  createdAt: UnixTimestamp;
  echoId: string | null;
  id: number;
  inboxId: number;
  messageType: MessageType;
  private: boolean;
  sender: Agent | AgentBot | Contact | null;
  sourceId: string | null;
  status: MessageStatus;
  lastNonActivityMessage: Message | null;
}
