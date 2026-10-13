import type { ImageMetadata, Message } from '@/types';

type PresentationButton = {
  key: string;
  title: string;
};

type PresentationListSection = {
  key: string;
  title?: string;
  rows: {
    key: string;
    title: string;
    description?: string;
  }[];
};

export type PresentationHeader =
  | { type: 'text'; text: string }
  | {
      type: 'image' | 'video' | 'document';
      attachment?: ImageMetadata;
    };

type PresentationCarouselCard = {
  key: number;
  body?: string;
  attachment: ImageMetadata;
} & (
  | {
      actionMode: 'quick_reply';
      buttons: PresentationButton[];
    }
  | {
      actionMode: 'url';
      button: string;
      url: string;
    }
);

export type WhatsAppInteractivePresentation =
  | {
      kind: 'button';
      header?: PresentationHeader;
      body: string;
      footer?: string;
      buttons: PresentationButton[];
    }
  | {
      kind: 'list';
      header?: PresentationHeader;
      body: string;
      footer?: string;
      button: string;
      sections: PresentationListSection[];
    }
  | {
      kind: 'cta_url';
      header?: PresentationHeader;
      body: string;
      footer?: string;
      button: string;
      url: string;
    }
  | {
      kind: 'carousel';
      header?: undefined;
      body: string;
      footer?: undefined;
      cards: PresentationCarouselCard[];
    }
  | {
      kind: 'reply';
      title: string;
      description?: string;
    }
  | {
      kind: 'fallback';
      content: string;
    };

type OptionalText = { valid: true; text?: string } | { valid: false };

const optionalText = (value: unknown): OptionalText => {
  if (value === undefined) {
    return { valid: true };
  }

  return typeof value === 'string' && value.length > 0
    ? { valid: true, text: value }
    : { valid: false };
};

const optionalTextContainer = (value: unknown): OptionalText => {
  if (value === undefined) {
    return { valid: true };
  }
  if (!value || typeof value !== 'object') {
    return { valid: false };
  }

  const text = (value as { text?: unknown }).text;
  return requiredString(text) ? { valid: true, text } : { valid: false };
};

const requiredString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

const normalizeHeader = (
  value: unknown,
  attachments: ImageMetadata[],
): { valid: true; header?: PresentationHeader } | { valid: false } => {
  if (value === undefined) {
    return { valid: true };
  }
  if (!value || typeof value !== 'object') {
    return { valid: false };
  }

  const header = value as { type?: unknown; text?: unknown; attachmentId?: unknown };
  if (header.type === 'text') {
    return requiredString(header.text)
      ? { valid: true, header: { type: 'text', text: header.text } }
      : { valid: false };
  }

  if (
    !['image', 'video', 'document'].includes(header.type as string) ||
    !isNonNegativeInteger(header.attachmentId)
  ) {
    return { valid: false };
  }

  const type = header.type as 'image' | 'video' | 'document';
  const expectedFileType = type === 'document' ? 'file' : type;
  return {
    valid: true,
    header: {
      type,
      attachment: attachments.find(
        attachment =>
          attachment?.id === header.attachmentId && attachment.fileType === expectedFileType,
      ),
    },
  };
};

const normalizeButtons = (value: unknown, knownKeys?: Set<string>): PresentationButton[] | null => {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const keys = knownKeys ?? new Set<string>();
  const buttons: PresentationButton[] = [];
  for (const valueButton of value) {
    if (!valueButton || typeof valueButton !== 'object') {
      return null;
    }

    const button = valueButton as { deliveryId?: unknown; title?: unknown };
    if (
      !requiredString(button.deliveryId) ||
      !requiredString(button.title) ||
      keys.has(button.deliveryId)
    ) {
      return null;
    }

    keys.add(button.deliveryId);
    buttons.push({ key: button.deliveryId, title: button.title });
  }

  return buttons;
};

const hasAny = (value: object, keys: string[]) => keys.some(key => key in value);

const normalizeButtonAction = (value: unknown, knownKeys?: Set<string>) => {
  if (
    !value ||
    typeof value !== 'object' ||
    hasAny(value, ['button', 'url', 'sections', 'cards'])
  ) {
    return null;
  }

  return normalizeButtons((value as { buttons?: unknown }).buttons, knownKeys);
};

const normalizeCtaAction = (value: unknown): { button: string; url: string } | null => {
  if (!value || typeof value !== 'object' || hasAny(value, ['buttons', 'sections', 'cards'])) {
    return null;
  }

  const action = value as { button?: unknown; url?: unknown };
  return requiredString(action.button) && requiredString(action.url)
    ? { button: action.button, url: action.url }
    : null;
};

const normalizeListAction = (
  value: unknown,
): { button: string; sections: PresentationListSection[] } | null => {
  if (!value || typeof value !== 'object' || hasAny(value, ['buttons', 'url', 'cards'])) {
    return null;
  }

  const action = value as { button?: unknown; sections?: unknown };
  if (
    !requiredString(action.button) ||
    !Array.isArray(action.sections) ||
    !action.sections.length
  ) {
    return null;
  }

  const rowKeys = new Set<string>();
  const sections: PresentationListSection[] = [];
  for (const rawSection of action.sections) {
    if (!rawSection || typeof rawSection !== 'object') {
      return null;
    }

    const section = rawSection as { title?: unknown; rows?: unknown };
    const title = optionalText(section.title);
    if (!title.valid || !Array.isArray(section.rows) || !section.rows.length) {
      return null;
    }

    const rows: PresentationListSection['rows'] = [];
    for (const rawRow of section.rows) {
      if (!rawRow || typeof rawRow !== 'object') {
        return null;
      }

      const row = rawRow as { deliveryId?: unknown; title?: unknown; description?: unknown };
      const description = optionalText(row.description);
      if (
        !requiredString(row.deliveryId) ||
        !requiredString(row.title) ||
        !description.valid ||
        rowKeys.has(row.deliveryId)
      ) {
        return null;
      }

      rowKeys.add(row.deliveryId);
      rows.push({ key: row.deliveryId, title: row.title, description: description.text });
    }

    sections.push({ key: rows[0].key, title: title.text, rows });
  }

  return { button: action.button, sections };
};

const normalizeCarousel = (
  value: unknown,
  attachments: ImageMetadata[],
): PresentationCarouselCard[] | null => {
  if (
    !value ||
    typeof value !== 'object' ||
    hasAny(value, ['buttons', 'button', 'url', 'sections'])
  ) {
    return null;
  }

  const cards = (value as { cards?: unknown }).cards;
  if (!Array.isArray(cards) || cards.length < 2 || cards.length > 10) {
    return null;
  }

  let actionMode: PresentationCarouselCard['actionMode'] | undefined;
  let quickReplyCount: number | undefined;
  const buttonKeys = new Set<string>();
  const presentationCards: PresentationCarouselCard[] = [];

  for (const [index, rawCard] of cards.entries()) {
    if (!rawCard || typeof rawCard !== 'object') {
      return null;
    }

    const card = rawCard as {
      cardIndex?: unknown;
      type?: unknown;
      header?: unknown;
      body?: unknown;
      action?: unknown;
    };
    const body = optionalTextContainer(card.body);
    const header = card.header as { type?: unknown; attachmentId?: unknown } | undefined;
    const attachment = attachments.find(
      candidate => candidate?.id === header?.attachmentId && candidate.fileType === 'image',
    );
    if (
      card.cardIndex !== index ||
      header?.type !== 'image' ||
      !isNonNegativeInteger(header.attachmentId) ||
      !attachment ||
      !body.valid
    ) {
      return null;
    }

    if (card.type === 'button') {
      const buttons = normalizeButtonAction(card.action, buttonKeys);
      if (
        !buttons ||
        (actionMode !== undefined && actionMode !== 'quick_reply') ||
        (quickReplyCount !== undefined && quickReplyCount !== buttons.length)
      ) {
        return null;
      }

      actionMode = 'quick_reply';
      quickReplyCount = buttons.length;
      presentationCards.push({
        key: index,
        body: body.text,
        attachment,
        actionMode,
        buttons,
      });
      continue;
    }

    if (card.type === 'cta_url') {
      const action = normalizeCtaAction(card.action);
      if (!action || (actionMode !== undefined && actionMode !== 'url')) {
        return null;
      }

      actionMode = 'url';
      presentationCards.push({
        key: index,
        body: body.text,
        attachment,
        actionMode,
        ...action,
      });
      continue;
    }

    return null;
  }

  return presentationCards;
};

const normalizeReply = (
  value: unknown,
): Extract<WhatsAppInteractivePresentation, { kind: 'reply' }> | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const reply = value as {
    type?: unknown;
    deliveryId?: unknown;
    title?: unknown;
    description?: unknown;
    contextId?: unknown;
    originatingMessageId?: unknown;
    presetOptionId?: unknown;
    cardIndex?: unknown;
  };
  const description = optionalText(reply.description);
  const contextId = optionalText(reply.contextId);
  const presetOptionIdIsValid =
    reply.presetOptionId === undefined ||
    reply.presetOptionId === null ||
    requiredString(reply.presetOptionId);
  if (
    !['button_reply', 'list_reply'].includes(reply.type as string) ||
    !requiredString(reply.deliveryId) ||
    !requiredString(reply.title) ||
    !description.valid ||
    !contextId.valid ||
    (reply.originatingMessageId !== undefined &&
      !isNonNegativeInteger(reply.originatingMessageId)) ||
    !presetOptionIdIsValid ||
    (reply.cardIndex !== undefined && !isNonNegativeInteger(reply.cardIndex))
  ) {
    return null;
  }

  return { kind: 'reply', title: reply.title, description: description.text };
};

export const getWhatsAppInteractivePresentation = (
  message: Message,
): WhatsAppInteractivePresentation | null => {
  const replyValue = message.contentAttributes?.whatsappInteractiveReply;
  if (replyValue !== undefined) {
    return normalizeReply(replyValue) ?? { kind: 'fallback', content: message.content };
  }

  const interactive = message.contentAttributes?.whatsappInteractive;
  if (!interactive) {
    return null;
  }
  if (interactive.schemaVersion !== 1) {
    return { kind: 'fallback', content: message.content };
  }

  const attachments = Array.isArray(message.attachments) ? message.attachments : [];
  const header = normalizeHeader(interactive.header, attachments);
  const body = optionalTextContainer(interactive.body);
  const footer = optionalTextContainer(interactive.footer);
  if (!header.valid || !body.valid || !footer.valid) {
    return { kind: 'fallback', content: message.content };
  }
  const bodyText = body.text;
  if (!requiredString(bodyText)) {
    return { kind: 'fallback', content: message.content };
  }

  if (interactive.type === 'button') {
    const buttons = normalizeButtonAction(interactive.action);
    return buttons
      ? { kind: 'button', header: header.header, body: bodyText, footer: footer.text, buttons }
      : { kind: 'fallback', content: message.content };
  }

  if (interactive.type === 'list') {
    if (header.header && header.header.type !== 'text') {
      return { kind: 'fallback', content: message.content };
    }
    const action = normalizeListAction(interactive.action);
    return action
      ? {
          kind: 'list',
          header: header.header,
          body: bodyText,
          footer: footer.text,
          ...action,
        }
      : { kind: 'fallback', content: message.content };
  }

  if (interactive.type === 'cta_url') {
    const action = normalizeCtaAction(interactive.action);
    return action
      ? {
          kind: 'cta_url',
          header: header.header,
          body: bodyText,
          footer: footer.text,
          ...action,
        }
      : { kind: 'fallback', content: message.content };
  }

  if (
    interactive.type === 'carousel' &&
    interactive.header === undefined &&
    interactive.footer === undefined
  ) {
    const cards = normalizeCarousel(interactive.action, attachments);
    if (cards) {
      return { kind: 'carousel', body: bodyText, cards };
    }
  }

  return { kind: 'fallback', content: message.content };
};
