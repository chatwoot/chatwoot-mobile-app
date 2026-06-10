export type WhatsAppTemplateHeaderFormat = 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION';

export type WhatsAppTemplateButton = {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY_CODE' | string;
  text?: string;
  url?: string;
  phoneNumber?: string;
  example?: string[];
};

export type WhatsAppTemplateComponent =
  | {
      type: 'HEADER';
      format?: WhatsAppTemplateHeaderFormat;
      text?: string;
      example?: { headerHandle?: string[]; headerText?: string[] };
    }
  | {
      type: 'BODY';
      text: string;
      example?: {
        bodyText?: string[][];
        bodyTextNamedParams?: { paramName: string; example: string }[];
      };
    }
  | { type: 'FOOTER'; text: string }
  | { type: 'BUTTONS'; buttons: WhatsAppTemplateButton[] };

export interface WhatsAppMessageTemplate {
  id?: string;
  name: string;
  status: string;
  category: string;
  language: string;
  namespace?: string;
  components: WhatsAppTemplateComponent[];
  parameterFormat?: 'POSITIONAL' | 'NAMED';
}

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
  types?: Record<string, unknown>;
}

export interface TwilioContentTemplates {
  templates?: TwilioContentTemplate[];
}

export type TemplatePlatform = 'whatsapp' | 'twilio';

export interface NormalizedTemplateHeader {
  format: WhatsAppTemplateHeaderFormat;
  text?: string;
}

export interface NormalizedTemplate {
  id: string;
  name: string;
  platform: TemplatePlatform;
  language: string;
  category?: string;
  namespace?: string;
  body: string;
  variables: string[];
  parameterFormat?: 'POSITIONAL' | 'NAMED';
  header?: NormalizedTemplateHeader;
  actions?: string[];
}

export interface TemplateSendParams {
  name: string;
  category?: string;
  language: string;
  namespace?: string;
  processed_params: {
    body: Record<string, string>;
    header?: {
      media_url: string;
      media_type: 'image' | 'video' | 'document';
      media_name?: string;
    };
  };
}
