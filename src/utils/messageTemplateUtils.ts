import type { Inbox } from '@/types/Inbox';
import type {
  NormalizedTemplate,
  NormalizedTemplateButton,
  NormalizedTemplateHeader,
  TemplateButtonParam,
  TemplateSendParams,
  TwilioContentTemplate,
  TwilioProcessedParams,
  WhatsAppMessageTemplate,
  WhatsAppProcessedParams,
  WhatsAppTemplateComponent,
} from '@/types/MessageTemplate';

const MEDIA_FORMATS = new Set(['IMAGE', 'VIDEO', 'DOCUMENT']);
// Component types that aren't supported when sending a template.
const UNSUPPORTED_COMPONENT_TYPES = new Set([
  'LIST',
  'PRODUCT',
  'CATALOG',
  'CALL_PERMISSION_REQUEST',
]);
const TWILIO_MEDIA_TEMPLATE_TYPE = 'media';
const VARIABLE_REGEX = /\{\{([^}]+)\}\}/g;

const findComponent = <T extends WhatsAppTemplateComponent['type']>(
  template: WhatsAppMessageTemplate,
  type: T,
): Extract<WhatsAppTemplateComponent, { type: T }> | undefined => {
  return template.components?.find(component => component.type === type) as
    | Extract<WhatsAppTemplateComponent, { type: T }>
    | undefined;
};

const isCsatTemplate = (name: string) => name.startsWith('customer_satisfaction_survey');

export const extractVariables = (body: string): string[] => {
  if (!body) return [];
  const matches = body.matchAll(VARIABLE_REGEX);
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const match of matches) {
    const key = match[1].trim();
    if (!seen.has(key)) {
      seen.add(key);
      ordered.push(key);
    }
  }
  return ordered;
};

export const renderTemplatePreview = (body: string, values: Record<string, string>): string => {
  if (!body) return '';
  return body.replace(VARIABLE_REGEX, (_match, rawKey) => {
    const key = rawKey.trim();
    const value = values[key];
    return value && value.length > 0 ? value : `{{${key}}}`;
  });
};

export const renderTemplateLabel = (body: string): string => {
  if (!body) return '';
  return body.replace(VARIABLE_REGEX, (_match, rawKey) => `{ ${rawKey.trim()} }`);
};

export type PreviewSegment = { text: string; filled: boolean };

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

/**
 * Filters WhatsApp templates down to the ones that can be sent:
 *  - requires status + components
 *  - status (case-insensitive) === 'approved'
 *  - category !== 'AUTHENTICATION'
 *  - name does not start with 'customer_satisfaction_survey'
 *  - no LIST/PRODUCT/CATALOG/CALL_PERMISSION_REQUEST component and no LOCATION header
 */
export const isSendableTemplate = (template: WhatsAppMessageTemplate): boolean => {
  if (!template || !template.status || !template.components) return false;
  if (template.status.toLowerCase() !== 'approved') return false;
  if (template.category === 'AUTHENTICATION') return false;
  if (template.name && isCsatTemplate(template.name)) return false;

  const hasUnsupportedComponents = template.components.some(
    component =>
      UNSUPPORTED_COMPONENT_TYPES.has(component.type) ||
      (component.type === 'HEADER' && component.format === 'LOCATION'),
  );
  if (hasUnsupportedComponents) return false;

  return true;
};

export const hasMediaHeader = (template: NormalizedTemplate): boolean => {
  return template.header ? MEDIA_FORMATS.has(template.header.format) : false;
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

const extractHeader = (template: WhatsAppMessageTemplate): NormalizedTemplateHeader | undefined => {
  const header = findComponent(template, 'HEADER');
  if (!header) return undefined;
  const format = header.format;
  if (!format) return undefined;
  return { format, text: header.text };
};

// Labels for the list-row action chips (display only).
const extractActions = (template: WhatsAppMessageTemplate): string[] | undefined => {
  const buttons = findComponent(template, 'BUTTONS');
  if (!buttons?.buttons?.length) return undefined;
  const labels = buttons.buttons
    .map(button => button.text?.trim())
    .filter((text): text is string => Boolean(text));
  return labels.length > 0 ? labels : undefined;
};

// Collect only the buttons that require a user-supplied parameter (URL buttons
// with a `{{ }}` variable, and COPY_CODE buttons), preserving their positional index.
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
        const buttonVars = button.url.match(VARIABLE_REGEX) || [];
        if (buttonVars.length > 0) {
          result.push({
            index,
            type: 'url',
            url: button.url,
            variables: buttonVars.map(v => v.replace(/{{|}}/g, '')),
          });
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
  const body = findComponent(template, 'BODY');
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
    parameterFormat: template.parameterFormat,
    header: extractHeader(template),
    actions: extractActions(template),
    buttons: extractButtonParams(template),
  };
};

const getTwilioMediaUrl = (template: TwilioContentTemplate): string => {
  return template.types?.['twilio/media']?.media?.[0] ?? '';
};

const normalizeTwilio = (template: TwilioContentTemplate): NormalizedTemplate | null => {
  // Twilio templates filter with an exact (case-sensitive) `status === 'approved'`.
  if (template.status !== 'approved') return null;
  const body = template.body || '';
  const isMediaTemplate = template.templateType === TWILIO_MEDIA_TEMPLATE_TYPE;
  const mediaUrl = isMediaTemplate ? getTwilioMediaUrl(template) : '';
  const mediaVariableKey = mediaUrl ? (mediaUrl.match(/{{(\d+)}}/)?.[1] ?? null) : null;
  return {
    id: template.contentSid,
    name: template.friendlyName,
    platform: 'twilio',
    language: template.language,
    category: template.category,
    body,
    variables: extractVariables(body),
    isMediaTemplate,
    mediaVariableKey,
    templateMediaUrl: mediaUrl,
  };
};

export const getTemplatesForInbox = (inbox: Inbox | undefined): NormalizedTemplate[] => {
  if (!inbox) return [];
  const whatsapp = (inbox.messageTemplates || []).filter(isSendableTemplate).map(normalizeWhatsApp);
  const twilio = (inbox.contentTemplates?.templates || [])
    .map(normalizeTwilio)
    .filter((entry): entry is NormalizedTemplate => entry !== null);
  return [...whatsapp, ...twilio];
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

/**
 * Extracts a filename from a URL.
 */
export const extractFilenameFromUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return url;
  try {
    const urlObj = new URL(url);
    const filename = urlObj.pathname.split('/').pop();
    return filename || url;
  } catch {
    const match = url.match(/\/([^/?#]+)(?:[?#]|$)/);
    return match ? match[1] : url;
  }
};

// Mutable form state collected by the in-conversation template form.
export interface TemplateFormState {
  // body variable values keyed by variable token
  bodyValues: Record<string, string>;
  // WhatsApp media header URL / Twilio media variable value
  mediaUrl: string;
  // WhatsApp document header filename (optional)
  mediaName: string;
  // WhatsApp button parameters keyed by button index
  buttonValues: Record<number, string>;
}

export const createEmptyFormState = (): TemplateFormState => ({
  bodyValues: {},
  mediaUrl: '',
  mediaName: '',
  buttonValues: {},
});

// Empty/missing values are invalid via a plain truthiness check, without trimming.
const isFilled = (value: string | undefined): boolean => Boolean(value);

// Whether the Twilio media variable input is in play.
const hasTwilioMediaVariable = (template: NormalizedTemplate): boolean => {
  return Boolean(template.isMediaTemplate && template.mediaVariableKey);
};

/**
 * Whether every required input for the template has been filled, for both platforms.
 */
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
  // Early-returns valid when there are no variables and no media header,
  // even if the template has buttons.
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
    // Sparse array indexed by button position.
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

// Renders the outgoing message body with the values the agent typed in.
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

export { MEDIA_FORMATS };
