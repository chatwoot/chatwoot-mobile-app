import type {
  ImageMetadata,
  Message,
  WhatsAppInteractiveButton,
  WhatsAppInteractiveCarouselCard,
  WhatsAppInteractiveHeader,
  WhatsAppInteractiveListAction,
} from '@/types';

export type PresentationHeader = WhatsAppInteractiveHeader & {
  attachment?: ImageMetadata;
};

type PresentationCarouselCard = {
  cardIndex: number;
  body?: string;
  attachment: ImageMetadata;
} & (
  | {
      actionMode: 'quick_reply';
      buttons: (WhatsAppInteractiveButton & { disabled: true })[];
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
      buttons: (WhatsAppInteractiveButton & { disabled: true })[];
    }
  | {
      kind: 'list';
      header?: PresentationHeader;
      body: string;
      footer?: string;
      button: string;
      sections: WhatsAppInteractiveListAction['sections'];
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
      deliveryId: string;
      contextId?: string;
      originatingMessageId?: number;
      presetOptionId?: string | null;
      cardIndex?: number;
    }
  | {
      kind: 'fallback';
      content: string;
    };

const isButtonAction = (
  action: NonNullable<NonNullable<Message['contentAttributes']>['whatsappInteractive']>['action'],
): action is { buttons: WhatsAppInteractiveButton[] } =>
  !!action && Array.isArray((action as { buttons?: unknown }).buttons);

const isCtaAction = (
  action: NonNullable<NonNullable<Message['contentAttributes']>['whatsappInteractive']>['action'],
): action is { button: string; url: string } => {
  const candidate = action as { button?: unknown; url?: unknown } | undefined;
  return typeof candidate?.button === 'string' && typeof candidate.url === 'string';
};

const isUsableCtaAction = (
  action: NonNullable<NonNullable<Message['contentAttributes']>['whatsappInteractive']>['action'],
): action is { button: string; url: string } =>
  isCtaAction(action) && action.button.length > 0 && action.url.length > 0;

const isUsableButton = (button: unknown): button is WhatsAppInteractiveButton => {
  if (!button || typeof button !== 'object') {
    return false;
  }

  const candidate = button as { deliveryId?: unknown; title?: unknown };
  return (
    typeof candidate.deliveryId === 'string' &&
    candidate.deliveryId.length > 0 &&
    typeof candidate.title === 'string' &&
    candidate.title.length > 0
  );
};

const isExclusiveButtonAction = (
  action: NonNullable<NonNullable<Message['contentAttributes']>['whatsappInteractive']>['action'],
): action is { buttons: WhatsAppInteractiveButton[] } =>
  isButtonAction(action) && !('button' in action) && !('url' in action);

const isExclusiveCtaAction = (
  action: NonNullable<NonNullable<Message['contentAttributes']>['whatsappInteractive']>['action'],
): action is { button: string; url: string } => isUsableCtaAction(action) && !('buttons' in action);

const resolveCarousel = (
  action: NonNullable<NonNullable<Message['contentAttributes']>['whatsappInteractive']>['action'],
  attachments: ImageMetadata[],
): PresentationCarouselCard[] | null => {
  const cards = (action as { cards?: unknown } | undefined)?.cards;
  if (!Array.isArray(cards) || cards.length < 2 || cards.length > 10) {
    return null;
  }

  let actionMode: PresentationCarouselCard['actionMode'] | undefined;
  let quickReplyCount: number | undefined;
  const deliveryIds = new Set<string>();
  const presentationCards: PresentationCarouselCard[] = [];

  for (const [index, rawCard] of cards.entries()) {
    if (!rawCard || typeof rawCard !== 'object') {
      return null;
    }

    const card = rawCard as WhatsAppInteractiveCarouselCard;
    const attachment = attachments.find(
      candidate => candidate.id === card.header?.attachmentId && candidate.fileType === 'image',
    );
    const body = card.body?.text;

    if (
      card.cardIndex !== index ||
      card.header?.type !== 'image' ||
      !attachment ||
      (body !== undefined && typeof body !== 'string')
    ) {
      return null;
    }

    if (card.type === 'button' && isExclusiveButtonAction(card.action)) {
      const buttons = card.action.buttons;
      if (buttons.length === 0 || !buttons.every(isUsableButton)) {
        return null;
      }

      const currentDeliveryIds = new Set(buttons.map(button => button.deliveryId));
      if (
        currentDeliveryIds.size !== buttons.length ||
        buttons.some(button => deliveryIds.has(button.deliveryId))
      ) {
        return null;
      }

      if (actionMode && actionMode !== 'quick_reply') {
        return null;
      }
      if (quickReplyCount !== undefined && quickReplyCount !== buttons.length) {
        return null;
      }

      actionMode = 'quick_reply';
      quickReplyCount = buttons.length;
      buttons.forEach(button => deliveryIds.add(button.deliveryId));
      presentationCards.push({
        cardIndex: card.cardIndex,
        body,
        attachment,
        actionMode,
        buttons: buttons.map(button => ({ ...button, disabled: true as const })),
      });
      continue;
    }

    if (card.type === 'cta_url' && isExclusiveCtaAction(card.action)) {
      if (actionMode && actionMode !== 'url') {
        return null;
      }

      actionMode = 'url';
      presentationCards.push({
        cardIndex: card.cardIndex,
        body,
        attachment,
        actionMode,
        button: card.action.button,
        url: card.action.url,
      });
      continue;
    }

    return null;
  }

  return presentationCards;
};

const isListAction = (
  action: NonNullable<NonNullable<Message['contentAttributes']>['whatsappInteractive']>['action'],
): action is WhatsAppInteractiveListAction => {
  const candidate = action as
    | {
        button?: unknown;
        sections?: unknown;
      }
    | undefined;

  if (
    typeof candidate?.button !== 'string' ||
    candidate.button.length === 0 ||
    !Array.isArray(candidate.sections) ||
    candidate.sections.length === 0
  ) {
    return false;
  }

  let rowCount = 0;
  const sectionsAreUsable = candidate.sections.every(section => {
    if (!section || typeof section !== 'object') {
      return false;
    }

    const { title, rows } = section as { title?: unknown; rows?: unknown };
    if (
      (title !== undefined && typeof title !== 'string') ||
      !Array.isArray(rows) ||
      rows.length === 0
    ) {
      return false;
    }

    rowCount += rows.length;
    return rows.every(row => {
      if (!row || typeof row !== 'object') {
        return false;
      }

      const {
        deliveryId,
        title: rowTitle,
        description,
      } = row as {
        deliveryId?: unknown;
        title?: unknown;
        description?: unknown;
      };
      return (
        typeof deliveryId === 'string' &&
        deliveryId.length > 0 &&
        typeof rowTitle === 'string' &&
        rowTitle.length > 0 &&
        (description === undefined || typeof description === 'string')
      );
    });
  });

  return sectionsAreUsable && rowCount > 0;
};

const resolveHeader = (
  header: WhatsAppInteractiveHeader | undefined,
  attachments: ImageMetadata[],
): PresentationHeader | undefined => {
  if (!header || header.type === 'text') {
    return header;
  }

  return {
    ...header,
    attachment: attachments.find(attachment => attachment.id === header.attachmentId),
  };
};

export const getWhatsAppInteractivePresentation = (
  message: Message,
): WhatsAppInteractivePresentation | null => {
  const reply = message.contentAttributes?.whatsappInteractiveReply;
  if (reply) {
    return {
      kind: 'reply',
      title: reply.title || message.content,
      description: reply.description,
      deliveryId: reply.deliveryId,
      contextId: reply.contextId,
      originatingMessageId: reply.originatingMessageId,
      presetOptionId: reply.presetOptionId,
      cardIndex: reply.cardIndex,
    };
  }

  const interactive = message.contentAttributes?.whatsappInteractive;
  if (!interactive) {
    return null;
  }

  if (interactive.schemaVersion !== 1) {
    return { kind: 'fallback', content: message.content };
  }

  const header = resolveHeader(interactive.header, message.attachments ?? []);
  const body = interactive.body?.text || message.content;

  if (interactive.type === 'button' && isButtonAction(interactive.action)) {
    return {
      kind: 'button',
      header,
      body,
      footer: interactive.footer?.text,
      buttons: interactive.action.buttons.map(button => ({ ...button, disabled: true as const })),
    };
  }

  if (interactive.type === 'list' && isListAction(interactive.action)) {
    return {
      kind: 'list',
      header,
      body,
      footer: interactive.footer?.text,
      button: interactive.action.button,
      sections: interactive.action.sections,
    };
  }

  if (interactive.type === 'cta_url' && isCtaAction(interactive.action)) {
    return {
      kind: 'cta_url',
      header,
      body,
      footer: interactive.footer?.text,
      button: interactive.action.button,
      url: interactive.action.url,
    };
  }

  if (interactive.type === 'carousel') {
    const cards = resolveCarousel(interactive.action, message.attachments ?? []);
    if (cards) {
      return {
        kind: 'carousel',
        body,
        cards,
      };
    }
  }

  return { kind: 'fallback', content: message.content };
};
