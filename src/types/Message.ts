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
  | 'voice_call'
  | 'input_csat'
  | 'integrations';

export type VoiceCallPayload = {
  id?: number;
  callId?: number;
  callSid?: string;
  providerCallId?: string;
  provider?: string;
  callSource?: string;
  status?: string;
  direction?: 'incoming' | 'outgoing' | 'inbound' | 'outbound';
  callDirection?: 'incoming' | 'outgoing' | 'inbound' | 'outbound';
  answeredBy?: string;
  acceptedBy?: { id?: number; name?: string };
  acceptedByAgentName?: string;
  accepted_by_agent_name?: string;
  recordingUrl?: string;
  recording_url?: string;
  transcript?: string;
  summary?: string;
  duration?: number;
  durationSeconds?: number;
  duration_seconds?: number;
  recordingDuration?: number;
  recording_duration?: number;
  endReason?: string;
  end_reason?: string;
};

export type VoiceCallContentAttributes = {
  data?: VoiceCallPayload;
};

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
  dataUrl: string;
  thumbUrl: string;
  fallbackTitle: string;
  coordinatesLat: number;
  coordinatesLong: number;
};

export type MessageContentAttributes = VoiceCallContentAttributes & {
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
  call?: VoiceCallPayload | null;
  lastNonActivityMessage: Message | null;
  conversation?: Conversation | null;
  shouldRenderAvatar?: boolean | false;
  senderId: number;
  groupWithNext?: boolean | false;
  groupWithPrevious?: boolean | false;
  senderType?: string;
}
