// Raw template + processed_params types come from the shared @chatwoot/utils
// package. The normalized model and form state below are mobile-specific.
export type {
  WhatsAppTemplateHeaderFormat,
  WhatsAppTemplateButton,
  WhatsAppTemplateComponent,
  WhatsAppMessageTemplate,
  TemplateButtonParam,
  WhatsAppProcessedParams,
  TwilioProcessedParams,
} from '@chatwoot/utils';

import type {
  WhatsAppTemplateHeaderFormat,
  WhatsAppProcessedParams,
  TwilioProcessedParams,
} from '@chatwoot/utils';

// The mobile app camelCases API responses, so Twilio content templates arrive
// with camelCase keys (the shared package uses the snake_case API shape).
export interface TwilioContentTemplate {
  contentSid: string;
  friendlyName: string;
  language: string;
  category?: string;
  status: string;
  templateType?: string;
  mediaType?: string;
  body: string;
  variables?: Record<string, string>;
  types?: Record<string, { media?: string[] } & Record<string, unknown>>;
}

export interface TwilioContentTemplates {
  templates?: TwilioContentTemplate[];
}

export type TemplatePlatform = 'whatsapp' | 'twilio';

export interface NormalizedTemplateHeader {
  format: WhatsAppTemplateHeaderFormat;
  text?: string;
}

export interface NormalizedTemplateButton {
  index: number;
  type: 'url' | 'copy_code';
  url?: string;
  variables?: string[];
}

// Flat, UI-friendly projection of a WhatsApp or Twilio template.
export interface NormalizedTemplate {
  id: string;
  name: string;
  platform: TemplatePlatform;
  language: string;
  category?: string;
  namespace?: string;
  body: string;
  variables: string[];
  header?: NormalizedTemplateHeader;
  actions?: string[];
  buttons?: NormalizedTemplateButton[];
  isMediaTemplate?: boolean;
  mediaVariableKey?: string | null;
  templateMediaUrl?: string;
}

export interface TemplateSendParams {
  name: string;
  category?: string;
  language: string;
  namespace?: string;
  processed_params: WhatsAppProcessedParams | TwilioProcessedParams;
}

// Mutable form state collected by the in-conversation template form.
export interface TemplateFormState {
  bodyValues: Record<string, string>;
  mediaUrl: string;
  mediaName: string;
  buttonValues: Record<number, string>;
}

export type PreviewSegment = { text: string; filled: boolean };
