import React from 'react';
import { StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { MESSAGE_VARIANTS } from '@/constants';
import { tailwind } from '@/theme';
import { transformMessage } from '@/utils/camelCaseKeys';
import conversationReducer, {
  addConversation,
  addOrUpdateMessage,
} from '@/store/conversation/conversationSlice';
import { conversation } from '@/store/conversation/specs/conversationMockData';

import { getWhatsAppInteractivePresentation } from '../whatsAppInteractivePresentation';
import { WhatsAppInteractiveBubble } from '../WhatsAppInteractiveBubble';
import {
  buttonHeaderVariants,
  buttonMessageEnvelope,
  carouselQuickReplyMessageEnvelope,
  carouselUrlOptionalBodyMessageEnvelope,
  carouselUrlMessageEnvelope,
  ctaUrlMessageEnvelope,
  inboundButtonReplyEnvelope,
  inboundCarouselReplyEnvelope,
  inboundListReplyEnvelope,
  listMessageEnvelope,
  listOptionalFieldsMessageEnvelope,
  malformedCarouselEnvelopes,
  malformedListMessageEnvelope,
  malformedTopLevelEnvelopes,
  unknownInboundReplyEnvelope,
} from './whatsappInteractiveHandoffFixtures';

jest.mock('@/context', () => ({
  useChatWindowContext: () => ({ conversationId: 401 }),
}));

jest.mock('@/hooks', () => ({
  useAppSelector: () => [],
}));

jest.mock('react-native-reanimated', () => {
  const { Text, View } = jest.requireActual('react-native');
  return { __esModule: true, default: { Text, View } };
});

jest.mock('../MarkdownBubble', () => {
  const ReactModule = jest.requireActual('react');
  const { Text } = jest.requireActual('react-native');
  return {
    MarkdownBubble: ({ messageContent }: { messageContent: string }) =>
      ReactModule.createElement(Text, null, messageContent),
  };
});

jest.mock('../MessageAttachments', () => {
  const ReactModule = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    MessageAttachments: ({ item }: { item: { attachments?: { id?: number }[] } }) =>
      ReactModule.createElement(View, {
        testID: `message-attachment-${item.attachments?.[0]?.id ?? 'none'}`,
      }),
  };
});
jest.mock('../ReplyMessageBubble', () => ({ ReplyMessageBubble: () => null }));

const mockPresentSheet = jest.fn();
jest.mock('@/components-next/common/sheet/Sheet', () => {
  const ReactModule = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    Sheet: ReactModule.forwardRef(
      ({ children }: { children: React.ReactNode }, ref: React.Ref<unknown>) => {
        ReactModule.useImperativeHandle(ref, () => ({
          present: mockPresentSheet,
          dismiss: jest.fn(),
          resize: jest.fn(),
        }));
        return ReactModule.createElement(View, { testID: 'whatsapp-list-sheet' }, children);
      },
    ),
  };
});

const storeMessage = (message: ReturnType<typeof transformMessage>) => {
  let state = conversationReducer(
    undefined,
    addConversation({ ...conversation, id: 401, messages: [] }),
  );
  state = conversationReducer(state, addOrUpdateMessage(message));
  return state.entities[401]?.messages[0];
};

const expectedHeaders: Record<string, object | undefined> = {
  absent: undefined,
  text: { type: 'text', text: 'Choose an action' },
  image: { type: 'image', attachment: { id: 501 } },
  video: { type: 'video', attachment: { id: 601 } },
  document: { type: 'document', attachment: { id: 602 } },
};

const outgoingAcceptanceCases = [
  {
    name: 'button',
    envelope: buttonMessageEnvelope,
    kind: 'button',
    labels: ['Confirm', 'Change'],
    disabledControls: 2,
    attachmentIds: [501],
    readableUrls: [],
  },
  {
    name: 'list',
    envelope: listMessageEnvelope,
    kind: 'list',
    labels: ['View meals'],
    disabledControls: 0,
    attachmentIds: [],
    readableUrls: [],
  },
  {
    name: 'CTA URL',
    envelope: ctaUrlMessageEnvelope,
    kind: 'cta_url',
    labels: ['View details'],
    disabledControls: 0,
    attachmentIds: [],
    readableUrls: ['https://example.test/details'],
  },
  {
    name: 'URL carousel',
    envelope: carouselUrlMessageEnvelope,
    kind: 'carousel',
    labels: ['View mountain', 'View beach'],
    disabledControls: 0,
    attachmentIds: [502, 503],
    readableUrls: ['https://example.test/mountain', 'https://example.test/beach'],
  },
  {
    name: 'quick-reply carousel',
    envelope: carouselQuickReplyMessageEnvelope,
    kind: 'carousel',
    labels: ['Choose', 'Details'],
    disabledControls: 4,
    attachmentIds: [504, 505],
    readableUrls: [],
  },
];

describe('WhatsAppInteractiveBubble presentation', () => {
  describe('SCN-16 final acceptance matrix', () => {
    it.each(outgoingAcceptanceCases)(
      'retains and mounts the canonical $name handoff as read-only',
      ({ envelope, kind, labels, disabledControls, attachmentIds, readableUrls }) => {
        const message = transformMessage(envelope);
        expect(storeMessage(message)?.contentAttributes?.whatsappInteractive).toEqual(
          message.contentAttributes?.whatsappInteractive,
        );
        expect(getWhatsAppInteractivePresentation(message)).toMatchObject({ kind });

        let tree: TestRenderer.ReactTestRenderer;
        act(() => {
          tree = TestRenderer.create(
            React.createElement(WhatsAppInteractiveBubble, {
              item: message,
              variant: MESSAGE_VARIANTS.AGENT,
            }),
          );
        });

        labels.forEach(label => {
          expect(tree!.root.findAll(node => node.children.includes(label)).length).toBeGreaterThan(
            0,
          );
        });
        attachmentIds.forEach(id => {
          expect(
            tree!.root.findAllByProps({ testID: `message-attachment-${id}` }).length,
          ).toBeGreaterThan(0);
        });
        readableUrls.forEach(url => {
          expect(tree!.root.find(node => node.children.includes(url)).props.selectable).toBe(true);
        });

        const activeControls = tree!.root.findAll(node => node.props.onPress !== undefined);
        expect(activeControls).toHaveLength(kind === 'list' ? 1 : 0);
        const disabled = tree!.root.findAll(
          node =>
            node.props.accessibilityRole === 'button' &&
            node.props.disabled === true &&
            node.parent?.props.accessibilityRole !== 'button',
        );
        expect(disabled).toHaveLength(disabledControls);
      },
    );

    it.each([
      ['button selection', inboundButtonReplyEnvelope, 'Confirm', undefined],
      ['list selection', inboundListReplyEnvelope, 'Pasta', 'Tomato and basil'],
      ['carousel selection', inboundCarouselReplyEnvelope, 'Choose', undefined],
      [
        'unknown provider selection',
        unknownInboundReplyEnvelope,
        'A provider-only choice',
        undefined,
      ],
    ])(
      'retains and mounts the canonical %s without response actions',
      (_name, envelope, title, description) => {
        const message = transformMessage(envelope);
        const storedReply = storeMessage(message)?.contentAttributes?.whatsappInteractiveReply;
        expect(storedReply).toEqual(message.contentAttributes?.whatsappInteractiveReply);
        expect(getWhatsAppInteractivePresentation(message)).toEqual({
          kind: 'reply',
          title,
          description,
        });

        let tree: TestRenderer.ReactTestRenderer;
        act(() => {
          tree = TestRenderer.create(
            React.createElement(WhatsAppInteractiveBubble, {
              item: message,
              variant: MESSAGE_VARIANTS.USER,
            }),
          );
        });

        expect(tree!.root.findAll(node => node.children.includes(title)).length).toBeGreaterThan(0);
        expect(tree!.root.findAll(node => node.props.onPress !== undefined)).toHaveLength(0);
        expect(tree!.root.findAll(node => node.props.accessibilityRole === 'button')).toHaveLength(
          0,
        );
      },
    );
  });

  it('deeply transforms the frozen button envelope and retains it through the store', () => {
    const message = transformMessage(buttonMessageEnvelope);
    expect(message.contentAttributes?.whatsappInteractive).toMatchObject({
      schemaVersion: 1,
      type: 'button',
      header: { type: 'image', attachmentId: 501 },
      action: {
        buttons: [
          {
            deliveryId: 'reply_00000000-0000-4000-8000-000000000001',
            title: 'Confirm',
            presetOptionId: '6ee65bd4-6ef0-4a7c-b5d1-d55ac85b9418',
          },
          {
            deliveryId: 'reply_00000000-0000-4000-8000-000000000002',
            title: 'Change',
            presetOptionId: 'a9ef6905-73b1-4a83-b42d-98c705c7430b',
          },
        ],
      },
      source: { presetId: 9001 },
    });

    expect(storeMessage(message)?.contentAttributes?.whatsappInteractive).toEqual(
      message.contentAttributes?.whatsappInteractive,
    );
  });

  it.each(Object.entries(buttonHeaderVariants))(
    'renders the %s button header while keeping every reply label disabled',
    (name, envelope) => {
      const presentation = getWhatsAppInteractivePresentation(transformMessage(envelope));

      if (name === 'absent') {
        expect(envelope.content_attributes.whatsapp_interactive).not.toHaveProperty('header');
      }

      expect(presentation).toMatchObject({
        kind: 'button',
        header: expectedHeaders[name],
        body: 'Please choose one option.',
        footer: 'Reply once',
        buttons: [{ title: 'Confirm' }, { title: 'Change' }],
      });
    },
  );

  it('omits missing matched header media without losing the body or buttons', () => {
    const presentation = getWhatsAppInteractivePresentation(
      transformMessage({ ...buttonMessageEnvelope, attachments: [] }),
    );

    expect(presentation).toMatchObject({
      kind: 'button',
      header: { type: 'image', attachment: undefined },
      body: 'Please choose one option.',
      buttons: [{ title: 'Confirm' }, { title: 'Change' }],
    });
  });

  it('keeps CTA content, label, and destination readable without response behavior', () => {
    expect(getWhatsAppInteractivePresentation(transformMessage(ctaUrlMessageEnvelope))).toEqual({
      kind: 'cta_url',
      header: { type: 'text', text: 'Order update' },
      body: 'Your order is ready to review.',
      footer: 'Secure link',
      button: 'View details',
      url: 'https://example.test/details',
    });
  });

  it('derives URL carousel cards in stored order with exact matched images', () => {
    expect(
      getWhatsAppInteractivePresentation(transformMessage(carouselUrlMessageEnvelope)),
    ).toEqual({
      kind: 'carousel',
      body: 'Choose a destination.',
      cards: [
        {
          key: 0,
          body: 'Mountain escape',
          attachment: expect.objectContaining({ id: 502, fileType: 'image' }),
          actionMode: 'url',
          button: 'View mountain',
          url: 'https://example.test/mountain',
        },
        {
          key: 1,
          body: 'Beach escape',
          attachment: expect.objectContaining({ id: 503, fileType: 'image' }),
          actionMode: 'url',
          button: 'View beach',
          url: 'https://example.test/beach',
        },
      ],
    });
  });

  it('derives uniform quick-reply carousel cards with every label disabled', () => {
    const presentation = getWhatsAppInteractivePresentation(
      transformMessage(carouselQuickReplyMessageEnvelope),
    );

    expect(presentation).toMatchObject({
      kind: 'carousel',
      cards: [
        {
          key: 0,
          attachment: { id: 504 },
          actionMode: 'quick_reply',
          buttons: [{ title: 'Choose' }, { title: 'Details' }],
        },
        {
          key: 1,
          attachment: { id: 505 },
          actionMode: 'quick_reply',
          buttons: [{ title: 'Choose' }, { title: 'Details' }],
        },
      ],
    });
  });

  it('accepts an omitted optional card body', () => {
    const presentation = getWhatsAppInteractivePresentation(
      transformMessage(carouselUrlOptionalBodyMessageEnvelope),
    );

    expect(presentation).toMatchObject({ kind: 'carousel' });
    if (presentation?.kind === 'carousel') {
      expect(presentation.cards[1].body).toBeUndefined();
    }
  });

  it.each([
    ['URL', carouselUrlMessageEnvelope, ['View mountain', 'View beach']],
    ['quick-reply', carouselQuickReplyMessageEnvelope, ['Choose', 'Details', 'Choose', 'Details']],
  ])('renders the %s carousel as ordered horizontal read-only cards', (_mode, envelope, labels) => {
    let tree: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        React.createElement(WhatsAppInteractiveBubble, {
          item: transformMessage(envelope),
          variant: MESSAGE_VARIANTS.AGENT,
        }),
      );
    });

    const carousel = tree!.root.findByProps({ testID: 'whatsapp-carousel' });
    expect(carousel.props.horizontal).toBe(true);
    expect(carousel.props.showsHorizontalScrollIndicator).toBe(false);

    const cards = [0, 1].map(index =>
      tree!.root.findByProps({ testID: `whatsapp-carousel-card-${index}` }),
    );
    expect(
      carousel
        .findAll(node => node.props.testID?.startsWith('whatsapp-carousel-card-'))
        .map(node => node.props.testID)
        .filter((testID, index, testIDs) => testIDs.indexOf(testID) === index),
    ).toEqual(['whatsapp-carousel-card-0', 'whatsapp-carousel-card-1']);
    const expectedAttachmentIds = _mode === 'URL' ? [502, 503] : [504, 505];
    cards.forEach((card, index) => {
      expect(
        card.findAllByProps({ testID: `message-attachment-${expectedAttachmentIds[index]}` })
          .length,
      ).toBeGreaterThan(0);
      expect(
        card.findAllByProps({
          testID: `message-attachment-${expectedAttachmentIds[index === 0 ? 1 : 0]}`,
        }),
      ).toHaveLength(0);
      expect(card.findAll(node => node.props.onPress !== undefined)).toHaveLength(0);
    });

    labels.forEach(label => {
      expect(tree!.root.findAll(node => node.children.includes(label)).length).toBeGreaterThan(0);
    });

    const controls = tree!.root.findAll(
      node =>
        node.props.accessibilityRole === 'button' &&
        node.parent?.props.accessibilityRole !== 'button',
    );
    if (_mode === 'URL') {
      expect(controls).toHaveLength(0);
      ['https://example.test/mountain', 'https://example.test/beach'].forEach(url => {
        expect(tree!.root.find(node => node.children.includes(url)).props.selectable).toBe(true);
      });
    } else {
      expect(controls).toHaveLength(4);
      controls.forEach(control => {
        expect(control.props.disabled).toBe(true);
        expect(control.props.accessibilityState).toEqual({ disabled: true });
        expect(control.props.onPress).toBeUndefined();
      });
    }
  });

  it.each(Object.entries(malformedCarouselEnvelopes))(
    'falls back without partially rendering a carousel with %s',
    (_name, envelope) => {
      expect(getWhatsAppInteractivePresentation(transformMessage(envelope))).toEqual({
        kind: 'fallback',
        content: 'Choose a destination.',
      });
    },
  );

  it('keeps unmatched carousel media out of the generic readable fallback', () => {
    let tree: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        React.createElement(WhatsAppInteractiveBubble, {
          item: transformMessage(malformedCarouselEnvelopes.unmatchedAttachment),
          variant: MESSAGE_VARIANTS.AGENT,
        }),
      );
    });

    expect(
      tree!.root.findAll(node => node.props.testID?.startsWith('message-attachment-')),
    ).toHaveLength(0);
    expect(
      tree!.root.findAll(node => node.children.includes('Choose a destination.')).length,
    ).toBeGreaterThan(0);
  });

  it('presents every list section and row in stored order', () => {
    const presentation = getWhatsAppInteractivePresentation(
      transformMessage(listOptionalFieldsMessageEnvelope),
    );

    expect(presentation).toEqual({
      kind: 'list',
      header: { type: 'text', text: 'Available meals' },
      body: 'Choose a meal.',
      footer: 'One selection per order.',
      button: 'View meals',
      sections: [
        {
          key: 'row_00000000-0000-4000-8000-000000000001',
          title: 'Lunch',
          rows: [
            {
              key: 'row_00000000-0000-4000-8000-000000000001',
              title: 'Pasta',
              description: 'Tomato and basil',
            },
            {
              key: 'row_00000000-0000-4000-8000-000000000002',
              title: 'Salad',
              description: undefined,
            },
          ],
        },
        {
          key: 'row_00000000-0000-4000-8000-000000000003',
          title: undefined,
          rows: [
            {
              key: 'row_00000000-0000-4000-8000-000000000003',
              title: 'Soup',
              description: undefined,
            },
          ],
        },
      ],
    });
  });

  it('opens a read-only list sheet with optional text omitted and no row controls', () => {
    let tree: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        React.createElement(WhatsAppInteractiveBubble, {
          item: transformMessage(listOptionalFieldsMessageEnvelope),
          variant: MESSAGE_VARIANTS.AGENT,
        }),
      );
    });

    const opener = tree!.root.findByProps({ accessibilityLabel: 'View meals' });
    act(() => opener.props.onPress());
    expect(mockPresentSheet).toHaveBeenCalledTimes(1);

    const sheet = tree!.root.findByProps({ testID: 'whatsapp-list-sheet' });
    ['Lunch', 'Pasta', 'Tomato and basil', 'Salad', 'Soup'].forEach(text => {
      expect(sheet.findAll(node => node.children.includes(text)).length).toBeGreaterThan(0);
    });
    expect(sheet.findAll(node => node.props.accessibilityRole === 'button')).toHaveLength(0);
    expect(sheet.findAll(node => node.props.onPress !== undefined)).toHaveLength(0);
  });

  it.each([
    ['empty sections', malformedListMessageEnvelope],
    [
      'future schema',
      {
        ...listMessageEnvelope,
        content_attributes: {
          whatsapp_interactive: {
            ...listMessageEnvelope.content_attributes.whatsapp_interactive,
            schema_version: 2,
          },
        },
      },
    ],
  ])('falls back to readable content for a list with %s', (_name, envelope) => {
    expect(getWhatsAppInteractivePresentation(transformMessage(envelope))).toEqual({
      kind: 'fallback',
      content: 'Choose a meal.',
    });
  });

  it.each(Object.entries(malformedTopLevelEnvelopes))(
    'falls back without partial controls or unstable identities for malformed %s data',
    (_name, envelope) => {
      const message = transformMessage(envelope);
      expect(getWhatsAppInteractivePresentation(message)).toEqual({
        kind: 'fallback',
        content: message.content,
      });

      let tree: TestRenderer.ReactTestRenderer;
      act(() => {
        tree = TestRenderer.create(
          React.createElement(WhatsAppInteractiveBubble, {
            item: message,
            variant: MESSAGE_VARIANTS.AGENT,
          }),
        );
      });

      expect(
        tree!.root.findAll(node => node.children.includes(message.content)).length,
      ).toBeGreaterThan(0);
      expect(tree!.root.findAll(node => node.props.onPress !== undefined)).toHaveLength(0);
      expect(tree!.root.findAll(node => node.props.accessibilityRole === 'button')).toHaveLength(0);
    },
  );

  it('falls back to readable content for a future schema version with a current type', () => {
    const futureSchemaButton = {
      ...buttonMessageEnvelope,
      content_attributes: {
        whatsapp_interactive: {
          ...buttonMessageEnvelope.content_attributes.whatsapp_interactive,
          schema_version: 2,
        },
      },
    };

    expect(getWhatsAppInteractivePresentation(transformMessage(futureSchemaButton))).toEqual({
      kind: 'fallback',
      content: 'Please choose one option.',
    });
  });

  it('renders reply labels as disabled controls and no active CTA control', () => {
    let buttonTree: TestRenderer.ReactTestRenderer;
    let ctaTree: TestRenderer.ReactTestRenderer;

    act(() => {
      buttonTree = TestRenderer.create(
        React.createElement(WhatsAppInteractiveBubble, {
          item: transformMessage(buttonHeaderVariants.absent),
          variant: MESSAGE_VARIANTS.AGENT,
        }),
      );
      ctaTree = TestRenderer.create(
        React.createElement(WhatsAppInteractiveBubble, {
          item: transformMessage(ctaUrlMessageEnvelope),
          variant: MESSAGE_VARIANTS.AGENT,
        }),
      );
    });

    const findButtonControls = (tree: TestRenderer.ReactTestRenderer) =>
      tree.root.findAll(
        node =>
          node.props.accessibilityRole === 'button' &&
          node.parent?.props.accessibilityRole !== 'button',
      );
    const replyControls = findButtonControls(buttonTree!);
    expect(replyControls).toHaveLength(2);
    replyControls.forEach(control => {
      expect(control.props.disabled).toBe(true);
      expect(control.props.accessibilityState).toEqual({ disabled: true });
      expect(control.props.onPress).toBeUndefined();
    });
    expect(findButtonControls(ctaTree!)).toHaveLength(0);
  });

  it('uses white auxiliary text on failed interactive message bubbles', () => {
    let buttonTree: TestRenderer.ReactTestRenderer;
    let ctaTree: TestRenderer.ReactTestRenderer;

    act(() => {
      buttonTree = TestRenderer.create(
        React.createElement(WhatsAppInteractiveBubble, {
          item: transformMessage(buttonHeaderVariants.text),
          variant: MESSAGE_VARIANTS.ERROR,
        }),
      );
      ctaTree = TestRenderer.create(
        React.createElement(WhatsAppInteractiveBubble, {
          item: transformMessage(ctaUrlMessageEnvelope),
          variant: MESSAGE_VARIANTS.ERROR,
        }),
      );
    });

    const expectWhiteText = (tree: TestRenderer.ReactTestRenderer, text: string) => {
      const textNodes = tree.root.findAll(
        node => node.children.includes(text) && node.props.style !== undefined,
      );
      expect(
        textNodes.some(
          node => StyleSheet.flatten(node.props.style)?.color === tailwind.color('text-white'),
        ),
      ).toBe(true);
    };

    ['Choose an action', 'Reply once', 'Confirm', 'Change'].forEach(text =>
      expectWhiteText(buttonTree!, text),
    );
    ['Order update', 'Secure link', 'View details', 'https://example.test/details'].forEach(text =>
      expectWhiteText(ctaTree!, text),
    );
  });

  it('deeply transforms and stores populated list and carousel snapshots', () => {
    const listMessage = transformMessage(listMessageEnvelope);
    const carouselMessage = transformMessage(carouselQuickReplyMessageEnvelope);

    expect(listMessage.contentAttributes?.whatsappInteractive).toMatchObject({
      type: 'list',
      action: {
        sections: [
          {
            title: 'Lunch',
            rows: [
              {
                deliveryId: 'row_00000000-0000-4000-8000-000000000001',
                description: 'Tomato and basil',
                presetOptionId: 'd6de08cc-03d3-49f4-9cb6-19d5c76efdf5',
              },
              {
                deliveryId: 'row_00000000-0000-4000-8000-000000000002',
                presetOptionId: 'e8d25cf1-202e-4796-bb8e-1ef173f91f98',
              },
            ],
          },
        ],
      },
    });
    expect(carouselMessage.contentAttributes?.whatsappInteractive).toMatchObject({
      type: 'carousel',
      action: {
        cards: [
          { cardIndex: 0, header: { attachmentId: 504 } },
          {
            cardIndex: 1,
            header: { attachmentId: 505 },
            action: {
              buttons: [
                {
                  deliveryId: 'reply_00000000-0000-4000-8000-000000000103',
                  presetOptionId: '957dd2f4-254f-4a7d-902c-9e89347c69d0',
                },
                {
                  deliveryId: 'reply_00000000-0000-4000-8000-000000000104',
                  presetOptionId: 'cb514b51-57c4-4137-be76-736b2401e711',
                },
              ],
            },
          },
        ],
      },
    });
    expect(storeMessage(listMessage)?.contentAttributes?.whatsappInteractive).toEqual(
      listMessage.contentAttributes?.whatsappInteractive,
    );
    expect(storeMessage(carouselMessage)?.contentAttributes?.whatsappInteractive).toEqual(
      carouselMessage.contentAttributes?.whatsappInteractive,
    );
  });

  it.each([
    [inboundButtonReplyEnvelope, 'Confirm', undefined, undefined],
    [inboundListReplyEnvelope, 'Pasta', 'Tomato and basil', undefined],
    [inboundCarouselReplyEnvelope, 'Choose', undefined, 1],
  ])(
    'retains readable known inbound selections and proven correlation',
    (envelope, title, description, cardIndex) => {
      const message = transformMessage(envelope);
      const presentation = getWhatsAppInteractivePresentation(message);
      const storedReply = storeMessage(message)?.contentAttributes?.whatsappInteractiveReply;

      expect(presentation).toMatchObject({
        kind: 'reply',
        title,
        description,
      });
      expect(presentation).not.toHaveProperty('deliveryId');
      expect(presentation).not.toHaveProperty('contextId');
      expect(presentation).not.toHaveProperty('originatingMessageId');
      expect(presentation).not.toHaveProperty('presetOptionId');
      expect(presentation).not.toHaveProperty('cardIndex');
      expect(storedReply).toEqual(message.contentAttributes?.whatsappInteractiveReply);
      expect(storedReply).toMatchObject({
        deliveryId: envelope.content_attributes.whatsapp_interactive_reply.delivery_id,
        contextId: envelope.content_attributes.whatsapp_interactive_reply.context_id,
        originatingMessageId:
          envelope.content_attributes.whatsapp_interactive_reply.originating_message_id,
        presetOptionId: envelope.content_attributes.whatsapp_interactive_reply.preset_option_id,
      });
      expect(storedReply?.cardIndex).toBe(cardIndex);
    },
  );

  it('does not synthesize preset or card identity for an unknown inbound delivery ID', () => {
    const message = transformMessage(unknownInboundReplyEnvelope);
    const reply = message.contentAttributes?.whatsappInteractiveReply;
    const storedReply = storeMessage(message)?.contentAttributes?.whatsappInteractiveReply;
    const presentation = getWhatsAppInteractivePresentation(message);

    expect(reply?.deliveryId).toBe('reply_unknown_provider_value');
    expect(reply).not.toHaveProperty('presetOptionId');
    expect(reply).not.toHaveProperty('cardIndex');
    expect(storedReply).toEqual(reply);
    expect(storedReply).not.toHaveProperty('presetOptionId');
    expect(storedReply).not.toHaveProperty('cardIndex');
    expect(presentation).toMatchObject({
      kind: 'reply',
      title: 'A provider-only choice',
    });
  });
});
