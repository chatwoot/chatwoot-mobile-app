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
  | 'integrations'
  | 'voice_call';

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

export type VoiceCallProvider = 'twilio' | 'whatsapp';

export type VoiceCallStatus =
  | 'ringing'
  | 'in-progress'
  | 'completed'
  | 'no-answer'
  | 'failed'
  | 'rejected';

// Live call state embedded in a voice_call message, mirrors Call#push_event_data
export type MessageCall = {
  id: number;
  providerCallId: string;
  provider: VoiceCallProvider;
  direction: 'incoming' | 'outgoing' | 'inbound' | 'outbound';
  status: VoiceCallStatus;
  // The provider's own last status; Twilio reports when the far handset is ringing
  providerStatus?: string | null;
  durationSeconds: number | null;
  endReason: string | null;
  conferenceSid: string | null;
  acceptedByAgentId: number | null;
  acceptedByAgentName: string | null;
  startedAt: UnixTimestamp | null;
  endedAt: UnixTimestamp | null;
  fromNumber: string | null;
  toNumber: string | null;
  recordingUrl: string | null;
  transcript: string | null;
};

// Snapshot written into content_attributes.data when the call message is created or updated
export type VoiceCallContentData = {
  callId?: number;
  callSid?: string;
  callSource?: VoiceCallProvider;
  callDirection?: 'inbound' | 'outbound';
  status?: string;
  acceptedBy?: { id: number; name: string };
  durationSeconds?: number;
};

export type MessageContentAttributes = {
  inReplyTo: number;
  inReplyToExternalId: null;
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
  data?: VoiceCallContentData;
};

export interface Message {
  id: number;
  attachments: ImageMetadata[];
  content: string;
  contentAttributes?: MessageContentAttributes | null;
  contentType: ContentType;
  call?: MessageCall | null;
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
