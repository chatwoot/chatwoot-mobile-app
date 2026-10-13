import { Agent } from './Agent';
import { AgentBot } from './AgentBot';
import { CaptainAssistant } from './CaptainAssistant';
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

export type ImageMetadata = {
  id: number;
  messageId: number;
  fileType: 'image' | 'video' | 'audio' | 'file' | 'ig_reel';
  accountId: number;
  extension: string | null;
  contentType?: string | null;
  dataUrl: string;
  thumbUrl: string;
  fallbackTitle: string;
  coordinatesLat: number;
  coordinatesLong: number;
};

export type WhatsAppInteractiveTextHeader = {
  type: 'text';
  text: string;
};

export type WhatsAppInteractiveMediaHeader = {
  type: 'image' | 'video' | 'document';
  attachmentId: number;
};

export type WhatsAppInteractiveHeader =
  | WhatsAppInteractiveTextHeader
  | WhatsAppInteractiveMediaHeader;

export type WhatsAppInteractiveButton = {
  deliveryId: string;
  title: string;
  presetOptionId?: string | null;
};

export type WhatsAppInteractiveButtonAction = {
  buttons: WhatsAppInteractiveButton[];
};

export type WhatsAppInteractiveCtaAction = {
  button: string;
  url: string;
};

export type WhatsAppInteractiveListRow = WhatsAppInteractiveButton & {
  description?: string;
};

export type WhatsAppInteractiveListAction = {
  button: string;
  sections: {
    title?: string;
    rows: WhatsAppInteractiveListRow[];
  }[];
};

export type WhatsAppInteractiveCarouselCard = {
  cardIndex: number;
  type: 'button' | 'cta_url';
  header: WhatsAppInteractiveMediaHeader;
  body?: { text: string };
  action: WhatsAppInteractiveButtonAction | WhatsAppInteractiveCtaAction;
};

export type WhatsAppInteractiveCarouselAction = {
  cards: WhatsAppInteractiveCarouselCard[];
};

export type WhatsAppInteractiveSnapshot = {
  schemaVersion: 1;
  type: 'button' | 'cta_url' | 'list' | 'carousel' | string;
  header?: WhatsAppInteractiveHeader;
  body?: { text: string };
  footer?: { text: string };
  action?:
    | WhatsAppInteractiveButtonAction
    | WhatsAppInteractiveCtaAction
    | WhatsAppInteractiveListAction
    | WhatsAppInteractiveCarouselAction
    | Record<string, unknown>;
  source?: {
    presetId?: number | null;
  };
};

export type WhatsAppInteractiveReply = {
  type: 'button_reply' | 'list_reply' | string;
  deliveryId: string;
  title: string;
  description?: string;
  contextId?: string;
  originatingMessageId?: number;
  presetOptionId?: string | null;
  cardIndex?: number;
};

export type MessageContentAttributes = {
  inReplyTo: number;
  inReplyToExternalId: string | null;
  deleted?: boolean;
  email?: {
    subject: string;
    from?: string[]; // Ensure this line is present
    to?: string[];
    cc?: string[];
    bcc?: string[];
    htmlContent?: {
      full: string;
    };
    textContent?: {
      full: string;
    };
  };
  ccEmails?: string[];
  bccEmails?: string[];
  externalError: string;
  imageType: string;
  contentType: ContentType;
  isUnsupported: boolean;
  translations?: Record<string, string>;
  whatsappInteractive?: WhatsAppInteractiveSnapshot;
  whatsappInteractiveReply?: WhatsAppInteractiveReply;
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
  sender?: Agent | User | AgentBot | CaptainAssistant | Contact | null;
  sourceId: string | null;
  status: MessageStatus;
  lastNonActivityMessage: Message | null;
  conversation?: Conversation | null;
  shouldRenderAvatar?: boolean | false;
  senderId?: number;
  groupWithNext?: boolean | false;
  groupWithPrevious?: boolean | false;
  senderType?: string;
  // Set when a send fails inside the app, before the message reaches the server
  meta?: { error?: string };
}
