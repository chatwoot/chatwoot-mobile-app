import type {
  ImageMetadata,
  Message,
  WhatsAppInteractiveButton,
  WhatsAppInteractiveHeader,
  WhatsAppInteractiveListAction,
} from '@/types';

export type PresentationHeader = WhatsAppInteractiveHeader & {
  attachment?: ImageMetadata;
};

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

  return { kind: 'fallback', content: message.content };
};
