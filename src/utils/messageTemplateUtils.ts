import type { Inbox } from '@/types/Inbox';
import { getTemplates } from '@chatwoot/utils';
import type { NormalizedTemplate } from '@chatwoot/utils';

// Template helpers re-exported from @chatwoot/utils.
export {
  extractVariables,
  renderTemplatePreview,
  renderTemplateLabel,
  buildPreviewSegments,
  isSendableTemplate,
  hasMediaHeader,
  isDocumentHeader,
  getMediaType,
  getHeaderSubtitle,
  normalizeWhatsApp,
  normalizeTwilio,
  getTemplates,
  filterTemplatesByQuery,
  createEmptyFormState,
  isTemplateComplete,
  buildTemplateParams,
  renderTemplateMessage,
  buildTemplateSendPayload,
  extractFilenameFromUrl,
  MEDIA_FORMATS,
} from '@chatwoot/utils';

export type { TemplateFormState, PreviewSegment } from '@chatwoot/utils';

// Normalizes the WhatsApp and Twilio template arrays carried by an inbox.
export const getTemplatesForInbox = (inbox: Inbox | undefined): NormalizedTemplate[] => {
  if (!inbox) return [];
  return getTemplates(inbox.messageTemplates, inbox.contentTemplates?.templates);
};
