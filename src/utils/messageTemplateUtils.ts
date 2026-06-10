import type { Inbox } from '@/types/Inbox';
import type {
  NormalizedTemplate,
  NormalizedTemplateHeader,
  TemplateSendParams,
  TwilioContentTemplate,
  WhatsAppMessageTemplate,
  WhatsAppTemplateComponent,
} from '@/types/MessageTemplate';

const MEDIA_HEADER_FORMATS = new Set(['IMAGE', 'VIDEO', 'DOCUMENT']);
const VARIABLE_REGEX = /\{\{([^{}]+)\}\}/g;

const findComponent = <T extends WhatsAppTemplateComponent['type']>(
  template: WhatsAppMessageTemplate,
  type: T,
): Extract<WhatsAppTemplateComponent, { type: T }> | undefined => {
  return template.components?.find(component => component.type === type) as
    | Extract<WhatsAppTemplateComponent, { type: T }>
    | undefined;
};

const isApproved = (status: string | undefined) => {
  return typeof status === 'string' && status.toLowerCase() === 'approved';
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

// Display form used by the list view, where `{{1}}` is shown as `{ 1 }`.
export const renderTemplateLabel = (body: string): string => {
  if (!body) return '';
  return body.replace(VARIABLE_REGEX, (_match, rawKey) => `{ ${rawKey.trim()} }`);
};

export const isSendableTemplate = (template: WhatsAppMessageTemplate): boolean => {
  if (!isApproved(template.status)) return false;
  if ((template.category || '').toUpperCase() === 'AUTHENTICATION') return false;
  if (isCsatTemplate(template.name || '')) return false;
  const body = findComponent(template, 'BODY');
  return Boolean(body?.text);
};

export const requiresImageUrl = (template: NormalizedTemplate): boolean => {
  return template.header?.format === 'IMAGE';
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

const extractActions = (template: WhatsAppMessageTemplate): string[] | undefined => {
  const buttons = findComponent(template, 'BUTTONS');
  if (!buttons?.buttons?.length) return undefined;
  const labels = buttons.buttons
    .map(button => button.text?.trim())
    .filter((text): text is string => Boolean(text));
  return labels.length > 0 ? labels : undefined;
};

const normalizeWhatsApp = (template: WhatsAppMessageTemplate): NormalizedTemplate | null => {
  const body = findComponent(template, 'BODY');
  if (!body?.text) return null;
  return {
    id: template.name,
    name: template.name,
    platform: 'whatsapp',
    language: template.language,
    category: template.category,
    namespace: template.namespace,
    body: body.text,
    variables: extractVariables(body.text),
    parameterFormat: template.parameterFormat,
    header: extractHeader(template),
    actions: extractActions(template),
  };
};

const normalizeTwilio = (template: TwilioContentTemplate): NormalizedTemplate | null => {
  if (!isApproved(template.status)) return null;
  if (!template.body) return null;
  return {
    id: template.contentSid,
    name: template.friendlyName,
    platform: 'twilio',
    language: template.language,
    category: template.category,
    body: template.body,
    variables: extractVariables(template.body),
  };
};

export const getTemplatesForInbox = (inbox: Inbox | undefined): NormalizedTemplate[] => {
  if (!inbox) return [];
  const whatsapp = (inbox.messageTemplates || [])
    .filter(isSendableTemplate)
    .map(normalizeWhatsApp)
    .filter((entry): entry is NormalizedTemplate => entry !== null);
  const twilio = (inbox.contentTemplates?.templates || [])
    .map(normalizeTwilio)
    .filter((entry): entry is NormalizedTemplate => entry !== null);
  return [...whatsapp, ...twilio];
};

export const filterTemplatesByQuery = (
  templates: NormalizedTemplate[],
  query: string,
): NormalizedTemplate[] => {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return templates;
  return templates.filter(template => {
    const haystack = [
      template.name,
      template.body,
      template.header?.text,
      ...(template.actions || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(trimmed);
  });
};

export const allVariablesFilled = (
  template: NormalizedTemplate,
  values: Record<string, string>,
): boolean => {
  return template.variables.every(key => {
    const value = values[key];
    return typeof value === 'string' && value.trim().length > 0;
  });
};

export const canSendTemplate = (
  template: NormalizedTemplate,
  values: Record<string, string>,
  imageUrl: string,
): boolean => {
  if (!allVariablesFilled(template, values)) return false;
  if (requiresImageUrl(template) && imageUrl.trim().length === 0) return false;
  return true;
};

export const buildTemplateParams = (
  template: NormalizedTemplate,
  values: Record<string, string>,
  imageUrl?: string,
): TemplateSendParams => {
  const body: Record<string, string> = {};
  template.variables.forEach(key => {
    body[key] = (values[key] ?? '').toString();
  });
  const processedParams: TemplateSendParams['processed_params'] = { body };
  if (requiresImageUrl(template) && imageUrl && imageUrl.trim().length > 0) {
    processedParams.header = { media: { url: imageUrl.trim() } };
  }
  return {
    name: template.name,
    category: template.category,
    language: template.language,
    namespace: template.namespace,
    processed_params: processedParams,
  };
};

export { MEDIA_HEADER_FORMATS };
