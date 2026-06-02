import type { Inbox } from '@/types/Inbox';
import type {
  NormalizedTemplate,
  TemplateSendParams,
  TwilioContentTemplate,
  WhatsAppMessageTemplate,
  WhatsAppTemplateComponent,
} from '@/types/MessageTemplate';

const MEDIA_HEADER_FORMATS = new Set(['IMAGE', 'VIDEO', 'DOCUMENT', 'LOCATION']);
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

export const isWhatsAppTextOnlyTemplate = (template: WhatsAppMessageTemplate): boolean => {
  if (!isApproved(template.status)) return false;
  if ((template.category || '').toUpperCase() === 'AUTHENTICATION') return false;
  if (isCsatTemplate(template.name || '')) return false;

  const header = findComponent(template, 'HEADER');
  if (header) {
    if (header.format && MEDIA_HEADER_FORMATS.has(header.format)) return false;
    // header.format === 'TEXT' is fine but may carry its own variables — supported via body merge below.
  }
  const buttons = findComponent(template, 'BUTTONS');
  if (buttons && buttons.buttons && buttons.buttons.length > 0) return false;

  const body = findComponent(template, 'BODY');
  return Boolean(body?.text);
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
    .filter(isWhatsAppTextOnlyTemplate)
    .map(normalizeWhatsApp)
    .filter((entry): entry is NormalizedTemplate => entry !== null);
  const twilio = (inbox.contentTemplates?.templates || [])
    .map(normalizeTwilio)
    .filter((entry): entry is NormalizedTemplate => entry !== null);
  return [...whatsapp, ...twilio];
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

export const buildTemplateParams = (
  template: NormalizedTemplate,
  values: Record<string, string>,
): TemplateSendParams => {
  const body: Record<string, string> = {};
  template.variables.forEach(key => {
    body[key] = (values[key] ?? '').toString();
  });
  return {
    name: template.name,
    category: template.category,
    language: template.language,
    namespace: template.namespace,
    processed_params: { body },
  };
};
