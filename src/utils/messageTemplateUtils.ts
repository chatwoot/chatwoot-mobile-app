import type { Inbox } from '@/types/Inbox';
import type {
  NormalizedTemplate,
  NormalizedTemplateButton,
  NormalizedTemplateHeader,
  PreviewSegment,
  TemplateButtonParam,
  TemplateFormState,
  TemplateSendParams,
  TwilioContentTemplate,
  TwilioProcessedParams,
  WhatsAppMessageTemplate,
  WhatsAppProcessedParams,
} from '@/types/MessageTemplate';
import {
  MEDIA_FORMATS,
  extractVariables,
  extractFilenameFromUrl,
  findComponentByType,
  isSendableTemplate,
  renderTemplatePreview,
  getTwilioMediaUrl,
  getTwilioMediaVariableKey,
  isTwilioMediaTemplate,
} from '@chatwoot/utils';
import type { TwilioContentTemplate as NeutralTwilioTemplate } from '@chatwoot/utils';

// Neutral primitives are re-exported so callers keep a single import path.
export {
  extractVariables,
  extractFilenameFromUrl,
  isSendableTemplate,
  renderTemplatePreview,
} from '@chatwoot/utils';
export type { TemplateFormState, PreviewSegment } from '@/types/MessageTemplate';

const VARIABLE_REGEX = /{{([^}]+)}}/g;

export const renderTemplateLabel = (body: string): string => {
  if (!body) return '';
  return body.replace(VARIABLE_REGEX, (_match, rawKey) => `{ ${rawKey.trim()} }`);
};

export const buildPreviewSegments = (
  body: string,
  values: Record<string, string>,
): PreviewSegment[] => {
  if (!body) return [];
  const segments: PreviewSegment[] = [];
  const regex = new RegExp(VARIABLE_REGEX.source, 'g');
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(body)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: body.slice(lastIndex, match.index), filled: false });
    }
    const key = match[1].trim();
    const value = values[key];
    if (value && value.length > 0) {
      segments.push({ text: value, filled: true });
    } else {
      segments.push({ text: `{{${key}}}`, filled: false });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < body.length) {
    segments.push({ text: body.slice(lastIndex), filled: false });
  }
  return segments;
};

export const hasMediaHeader = (template: NormalizedTemplate): boolean => {
  return template.header ? MEDIA_FORMATS.indexOf(template.header.format) !== -1 : false;
};

export const isDocumentHeader = (template: NormalizedTemplate): boolean => {
  return template.header?.format === 'DOCUMENT';
};

export const getMediaType = (template: NormalizedTemplate): string => {
  return template.header ? template.header.format.toLowerCase() : '';
};

const headerLabelMap: Record<string, string | undefined> = {
  IMAGE: 'Image Header',
  VIDEO: 'Video Header',
  DOCUMENT: 'Document Header',
  LOCATION: 'Location Header',
};

export const getHeaderSubtitle = (template: NormalizedTemplate): string | undefined => {
  const header = template.header;
  if (!header) return undefined;
  if (header.format === 'TEXT') return header.text;
  return headerLabelMap[header.format];
};

const extractHeader = (
  template: WhatsAppMessageTemplate,
): NormalizedTemplateHeader | undefined => {
  const header = findComponentByType(template, 'HEADER');
  if (!header?.format) return undefined;
  return { format: header.format, text: header.text };
};

// Labels for the list-row action chips (display only).
const extractActions = (template: WhatsAppMessageTemplate): string[] | undefined => {
  const buttons = findComponentByType(template, 'BUTTONS');
  if (!buttons?.buttons?.length) return undefined;
  const labels = buttons.buttons
    .map(button => button.text?.trim())
    .filter((text): text is string => Boolean(text));
  return labels.length > 0 ? labels : undefined;
};

// Collects the URL/COPY_CODE buttons that need a user-supplied parameter,
// preserving their positional index.
const extractButtonParams = (
  template: WhatsAppMessageTemplate,
): NormalizedTemplateButton[] | undefined => {
  const buttonComponents = (template.components || []).filter(
    component => component.type === 'BUTTONS',
  );
  const result: NormalizedTemplateButton[] = [];
  buttonComponents.forEach(component => {
    if (component.type !== 'BUTTONS' || !component.buttons) return;
    component.buttons.forEach((button, index) => {
      if (button.type === 'URL' && button.url && button.url.includes('{{')) {
        const variables = extractVariables(button.url);
        if (variables.length > 0) {
          result.push({ index, type: 'url', url: button.url, variables });
        }
      }
      if (button.type === 'COPY_CODE') {
        result.push({ index, type: 'copy_code' });
      }
    });
  });
  return result.length > 0 ? result : undefined;
};

const normalizeWhatsApp = (template: WhatsAppMessageTemplate): NormalizedTemplate => {
  const body = findComponentByType(template, 'BODY');
  const bodyText = body?.text ?? '';
  return {
    id: template.name,
    name: template.name,
    platform: 'whatsapp',
    language: template.language,
    category: template.category,
    namespace: template.namespace,
    body: bodyText,
    variables: extractVariables(bodyText),
    header: extractHeader(template),
    actions: extractActions(template),
    buttons: extractButtonParams(template),
  };
};

// Adapts a camelCased mobile Twilio template to the shared package's snake_case
// shape so the neutral Twilio helpers can read it.
const toNeutralTwilio = (template: TwilioContentTemplate): NeutralTwilioTemplate => ({
  content_sid: template.contentSid,
  friendly_name: template.friendlyName,
  language: template.language,
  category: template.category,
  status: template.status,
  template_type: template.templateType,
  media_type: template.mediaType,
  body: template.body,
  variables: template.variables,
  types: template.types,
});

const normalizeTwilio = (template: TwilioContentTemplate): NormalizedTemplate | null => {
  if (template.status !== 'approved') return null;
  const neutral = toNeutralTwilio(template);
  const body = template.body || '';
  const isMediaTemplate = isTwilioMediaTemplate(neutral);
  return {
    id: template.contentSid,
    name: template.friendlyName,
    platform: 'twilio',
    language: template.language,
    category: template.category,
    body,
    variables: extractVariables(body),
    isMediaTemplate,
    mediaVariableKey: getTwilioMediaVariableKey(neutral),
    templateMediaUrl: isMediaTemplate ? getTwilioMediaUrl(neutral) : '',
  };
};

// `message_templates` and `content_templates` are jsonb columns that default to
// `{}`, so a channel that has never synced templates serves an object, not an array.
const toArray = <T>(value: T[] | undefined): T[] => (Array.isArray(value) ? value : []);

export const getTemplates = (
  messageTemplates: WhatsAppMessageTemplate[] | undefined,
  contentTemplates: TwilioContentTemplate[] | undefined,
): NormalizedTemplate[] => {
  const whatsapp = toArray(messageTemplates).filter(isSendableTemplate).map(normalizeWhatsApp);
  const twilio = toArray(contentTemplates)
    .map(normalizeTwilio)
    .filter((entry): entry is NormalizedTemplate => entry !== null);
  return [...whatsapp, ...twilio];
};

export const getTemplatesForInbox = (inbox: Inbox | undefined): NormalizedTemplate[] => {
  if (!inbox) return [];
  return getTemplates(inbox.messageTemplates, inbox.contentTemplates?.templates);
};

// Search by template name only (WhatsApp `name`, Twilio `friendly_name`).
export const filterTemplatesByQuery = (
  templates: NormalizedTemplate[],
  query: string,
): NormalizedTemplate[] => {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return templates;
  return templates.filter(template => template.name.toLowerCase().includes(trimmed));
};

export const createEmptyFormState = (): TemplateFormState => ({
  bodyValues: {},
  mediaUrl: '',
  mediaName: '',
  buttonValues: {},
});

const isFilled = (value: string | undefined): boolean => Boolean(value);

const hasTwilioMediaVariable = (template: NormalizedTemplate): boolean => {
  return Boolean(template.isMediaTemplate && template.mediaVariableKey);
};

export const isTemplateComplete = (
  template: NormalizedTemplate,
  state: TemplateFormState,
): boolean => {
  if (template.platform === 'twilio') {
    const mediaVariable = hasTwilioMediaVariable(template);
    if (template.variables.length === 0 && !mediaVariable) return true;
    if (template.variables.some(key => !isFilled(state.bodyValues[key]))) return false;
    if (mediaVariable && !isFilled(state.mediaUrl)) return false;
    return true;
  }

  const media = hasMediaHeader(template);
  if (template.variables.length === 0 && !media) return true;
  if (media && !isFilled(state.mediaUrl)) return false;
  if (template.variables.some(key => !isFilled(state.bodyValues[key]))) return false;
  if (template.buttons?.some(button => !isFilled(state.buttonValues[button.index]))) return false;
  return true;
};

const buildWhatsAppParams = (
  template: NormalizedTemplate,
  state: TemplateFormState,
): TemplateSendParams => {
  const processedParams: WhatsAppProcessedParams = {};

  if (template.variables.length > 0) {
    const body: Record<string, string> = {};
    template.variables.forEach(key => {
      body[key] = state.bodyValues[key] ?? '';
    });
    processedParams.body = body;
  }

  if (hasMediaHeader(template)) {
    processedParams.header = {
      media_url: state.mediaUrl,
      media_type: getMediaType(template),
    };
    if (isDocumentHeader(template)) {
      processedParams.header.media_name = state.mediaName ?? '';
    }
  }

  if (template.buttons && template.buttons.length > 0) {
    const buttons: TemplateButtonParam[] = [];
    template.buttons.forEach(button => {
      buttons[button.index] =
        button.type === 'url'
          ? {
              type: 'url',
              parameter: state.buttonValues[button.index] ?? '',
              url: button.url,
              variables: button.variables,
            }
          : { type: 'copy_code', parameter: state.buttonValues[button.index] ?? '' };
    });
    processedParams.buttons = buttons;
  }

  return {
    name: template.name,
    category: template.category,
    language: template.language,
    namespace: template.namespace,
    processed_params: processedParams,
  };
};

const buildTwilioParams = (
  template: NormalizedTemplate,
  state: TemplateFormState,
): TemplateSendParams => {
  const processedParams: TwilioProcessedParams = {};
  template.variables.forEach(key => {
    processedParams[key] = state.bodyValues[key] ?? '';
  });
  if (template.mediaVariableKey) {
    processedParams[template.mediaVariableKey] = state.mediaUrl
      ? extractFilenameFromUrl(state.mediaUrl)
      : '';
  }
  return {
    name: template.name,
    language: template.language,
    processed_params: processedParams,
  };
};

export const buildTemplateParams = (
  template: NormalizedTemplate,
  state: TemplateFormState,
): TemplateSendParams => {
  return template.platform === 'twilio'
    ? buildTwilioParams(template, state)
    : buildWhatsAppParams(template, state);
};

export const renderTemplateMessage = (
  template: NormalizedTemplate,
  state: TemplateFormState,
): string => {
  const values: Record<string, string> = { ...state.bodyValues };
  if (template.platform === 'twilio' && template.mediaVariableKey) {
    values[template.mediaVariableKey] = state.mediaUrl;
  }
  return renderTemplatePreview(template.body, values);
};

export const buildTemplateSendPayload = (
  template: NormalizedTemplate,
  state: TemplateFormState,
): { message: string; templateParams: TemplateSendParams } => {
  return {
    message: renderTemplateMessage(template, state),
    templateParams: buildTemplateParams(template, state),
  };
};
