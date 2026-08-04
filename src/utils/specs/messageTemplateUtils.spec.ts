import type { Inbox } from '@/types/Inbox';
import type {
  NormalizedTemplate,
  TwilioContentTemplate,
  WhatsAppMessageTemplate,
} from '@/types/MessageTemplate';
import {
  TemplateFormState,
  buildTemplateParams,
  buildTemplateSendPayload,
  createEmptyFormState,
  extractFilenameFromUrl,
  extractVariables,
  filterTemplatesByQuery,
  getHeaderSubtitle,
  getMediaType,
  getTemplatesForInbox,
  hasMediaHeader,
  isDocumentHeader,
  isSendableTemplate,
  isTemplateComplete,
  renderTemplateLabel,
  renderTemplatePreview,
} from '../messageTemplateUtils';

const baseTemplate = (
  overrides: Partial<WhatsAppMessageTemplate> = {},
): WhatsAppMessageTemplate => ({
  name: 'sample_flight_confirmation',
  status: 'approved',
  category: 'UTILITY',
  language: 'en_US',
  namespace: 'ns-1',
  components: [
    {
      type: 'BODY',
      text: 'This is your flight confirmation from {{1}} to {{2}} for {{3}}',
    },
  ],
  ...overrides,
});

const normalized = (overrides: Partial<NormalizedTemplate> = {}): NormalizedTemplate => ({
  id: 't',
  name: 't',
  platform: 'whatsapp',
  language: 'en',
  body: '{{1}}',
  variables: ['1'],
  ...overrides,
});

const formState = (overrides: Partial<TemplateFormState> = {}): TemplateFormState => ({
  ...createEmptyFormState(),
  ...overrides,
});

describe('extractVariables', () => {
  it('returns positional variables in order without duplicates', () => {
    expect(extractVariables('Hi {{1}}, your {{2}} order on {{1}}')).toEqual(['1', '2']);
  });

  it('returns named variables', () => {
    expect(extractVariables('Hi {{name}}, welcome to {{company}}')).toEqual(['name', 'company']);
  });

  it('returns empty array for body with no variables', () => {
    expect(extractVariables('Plain body')).toEqual([]);
  });

  it('handles empty input safely', () => {
    expect(extractVariables('')).toEqual([]);
  });
});

describe('renderTemplatePreview', () => {
  it('substitutes filled values and leaves placeholders for empty', () => {
    const body = 'Hi {{1}}, your order to {{2}}';
    expect(renderTemplatePreview(body, { '1': 'Devi' })).toBe('Hi Devi, your order to {{2}}');
  });

  it('does not substitute empty strings', () => {
    expect(renderTemplatePreview('Hi {{1}}', { '1': '' })).toBe('Hi {{1}}');
  });
});

describe('renderTemplateLabel', () => {
  it('converts {{n}} placeholders to { n } for display', () => {
    expect(renderTemplateLabel('From {{1}} to {{2}}')).toBe('From { 1 } to { 2 }');
  });

  it('handles named params', () => {
    expect(renderTemplateLabel('Hi {{name}}')).toBe('Hi { name }');
  });
});

// Mirrors web getFilteredWhatsAppTemplates (store/modules/inboxes.js).
describe('isSendableTemplate', () => {
  it('accepts approved text-body templates', () => {
    expect(isSendableTemplate(baseTemplate())).toBe(true);
  });

  it('accepts approved templates regardless of status casing', () => {
    expect(isSendableTemplate(baseTemplate({ status: 'APPROVED' }))).toBe(true);
  });

  it('rejects non-approved templates', () => {
    expect(isSendableTemplate(baseTemplate({ status: 'pending' }))).toBe(false);
  });

  it('rejects AUTHENTICATION category', () => {
    expect(isSendableTemplate(baseTemplate({ category: 'AUTHENTICATION' }))).toBe(false);
  });

  it('rejects CSAT survey templates by name prefix', () => {
    expect(isSendableTemplate(baseTemplate({ name: 'customer_satisfaction_survey_v1' }))).toBe(
      false,
    );
  });

  it('accepts templates with image, video and document media headers', () => {
    (['IMAGE', 'VIDEO', 'DOCUMENT'] as const).forEach(format => {
      expect(
        isSendableTemplate(
          baseTemplate({
            components: [
              { type: 'HEADER', format },
              { type: 'BODY', text: 'Hi {{1}}' },
            ],
          }),
        ),
      ).toBe(true);
    });
  });

  it('accepts templates with a TEXT header', () => {
    expect(
      isSendableTemplate(
        baseTemplate({
          components: [
            { type: 'HEADER', format: 'TEXT', text: 'Header' },
            { type: 'BODY', text: 'Hi {{1}}' },
          ],
        }),
      ),
    ).toBe(true);
  });

  it('accepts templates with COPY_CODE buttons', () => {
    expect(
      isSendableTemplate(
        baseTemplate({
          components: [
            { type: 'BODY', text: 'Hi {{1}}' },
            { type: 'BUTTONS', buttons: [{ type: 'COPY_CODE', text: 'Copy code' }] },
          ],
        }),
      ),
    ).toBe(true);
  });

  it('accepts templates with URL buttons containing variables', () => {
    expect(
      isSendableTemplate(
        baseTemplate({
          components: [
            { type: 'BODY', text: 'Hi {{1}}' },
            {
              type: 'BUTTONS',
              buttons: [{ type: 'URL', text: 'Visit', url: 'https://x.com/{{1}}' }],
            },
          ],
        }),
      ),
    ).toBe(true);
  });

  it('rejects templates with LOCATION header', () => {
    expect(
      isSendableTemplate(
        baseTemplate({
          components: [
            { type: 'HEADER', format: 'LOCATION' },
            { type: 'BODY', text: 'Hi {{1}}' },
          ],
        }),
      ),
    ).toBe(false);
  });

  it('rejects templates with unsupported component types', () => {
    const cases = ['LIST', 'PRODUCT', 'CATALOG', 'CALL_PERMISSION_REQUEST'];
    cases.forEach(type => {
      expect(
        isSendableTemplate(
          baseTemplate({
            components: [
              { type: 'BODY', text: 'Hi {{1}}' },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              { type: type as any },
            ],
          }),
        ),
      ).toBe(false);
    });
  });

  it('rejects templates missing status or components', () => {
    expect(isSendableTemplate(baseTemplate({ status: '' as unknown as string }))).toBe(false);
    expect(isSendableTemplate(baseTemplate({ components: undefined as unknown as never }))).toBe(
      false,
    );
  });
});

describe('getTemplatesForInbox', () => {
  it('normalizes whatsapp templates with header and action labels', () => {
    const inbox = {
      messageTemplates: [
        baseTemplate({
          name: 'delivery_failed',
          components: [
            { type: 'HEADER', format: 'TEXT', text: 'Could not deliver your order' },
            { type: 'BODY', text: 'Hi {{1}}, your order {{2}} could not be delivered' },
            {
              type: 'BUTTONS',
              buttons: [
                { type: 'QUICK_REPLY', text: 'Manage delivery' },
                { type: 'URL', text: 'Call us' },
              ],
            },
          ],
        }),
      ],
    } as Inbox;
    const templates = getTemplatesForInbox(inbox);
    expect(templates).toHaveLength(1);
    expect(templates[0].header).toEqual({
      format: 'TEXT',
      text: 'Could not deliver your order',
    });
    expect(templates[0].actions).toEqual(['Manage delivery', 'Call us']);
  });

  it('extracts URL-variable and COPY_CODE button parameters with their index', () => {
    const inbox = {
      messageTemplates: [
        baseTemplate({
          name: 'with_buttons',
          components: [
            { type: 'BODY', text: 'Hi {{1}}' },
            {
              type: 'BUTTONS',
              buttons: [
                { type: 'QUICK_REPLY', text: 'No-op' },
                { type: 'URL', text: 'Track', url: 'https://x.com/{{1}}' },
                { type: 'COPY_CODE', text: 'Copy' },
              ],
            },
          ],
        }),
      ],
    } as Inbox;
    const [template] = getTemplatesForInbox(inbox);
    expect(template.buttons).toEqual([
      { index: 1, type: 'url', url: 'https://x.com/{{1}}', variables: ['1'] },
      { index: 2, type: 'copy_code' },
    ]);
  });

  it('returns twilio content templates normalized (approved only, exact case)', () => {
    const inbox = {
      contentTemplates: {
        templates: [
          {
            contentSid: 'HX001',
            friendlyName: 'order_update',
            language: 'en',
            status: 'approved',
            body: 'Order {{1}} is on the way',
          },
          {
            contentSid: 'HX002',
            friendlyName: 'pending_one',
            language: 'en',
            status: 'Approved',
            body: 'Nope {{1}}',
          },
        ] as TwilioContentTemplate[],
      },
    } as Inbox;
    const templates = getTemplatesForInbox(inbox);
    expect(templates).toHaveLength(1);
    expect(templates[0]).toMatchObject({
      id: 'HX001',
      name: 'order_update',
      platform: 'twilio',
      variables: ['1'],
    });
  });

  it('captures the twilio media variable key from types["twilio/media"]', () => {
    const inbox = {
      contentTemplates: {
        templates: [
          {
            contentSid: 'HX003',
            friendlyName: 'media_template',
            language: 'en',
            status: 'approved',
            templateType: 'media',
            body: 'Here is your file {{2}}',
            types: { 'twilio/media': { media: ['https://cdn.example.com/{{1}}'] } },
          },
        ] as TwilioContentTemplate[],
      },
    } as Inbox;
    const [template] = getTemplatesForInbox(inbox);
    expect(template.isMediaTemplate).toBe(true);
    expect(template.mediaVariableKey).toBe('1');
    expect(template.variables).toEqual(['2']);
  });

  it('returns empty array for inbox with no templates', () => {
    expect(getTemplatesForInbox({} as Inbox)).toEqual([]);
    expect(getTemplatesForInbox(undefined)).toEqual([]);
  });

  it('returns empty array when the api serves the jsonb defaults as objects', () => {
    const inbox = {
      messageTemplates: {},
      contentTemplates: {},
    } as unknown as Inbox;
    expect(getTemplatesForInbox(inbox)).toEqual([]);
  });

  it('ignores non-array template collections', () => {
    const inbox = {
      messageTemplates: 'invalid',
      contentTemplates: { templates: {} },
    } as unknown as Inbox;
    expect(getTemplatesForInbox(inbox)).toEqual([]);
  });
});

describe('getHeaderSubtitle', () => {
  it('returns header text for TEXT header', () => {
    expect(getHeaderSubtitle(normalized({ header: { format: 'TEXT', text: 'Header text' } }))).toBe(
      'Header text',
    );
  });

  it('returns label for media headers', () => {
    expect(getHeaderSubtitle(normalized({ header: { format: 'IMAGE' } }))).toBe('Image Header');
    expect(getHeaderSubtitle(normalized({ header: { format: 'VIDEO' } }))).toBe('Video Header');
    expect(getHeaderSubtitle(normalized({ header: { format: 'DOCUMENT' } }))).toBe(
      'Document Header',
    );
  });

  it('returns undefined when template has no header', () => {
    expect(getHeaderSubtitle(normalized())).toBeUndefined();
  });
});

describe('filterTemplatesByQuery', () => {
  const templates = [
    normalized({ id: 'a', name: 'flight_confirmation', body: 'Hi {{1}}' }),
    normalized({ id: 'b', name: 'order_update', body: 'Your order has shipped' }),
    normalized({ id: 'c', name: 'delivery_failed', body: 'Could not deliver' }),
  ];

  it('returns all templates for an empty query', () => {
    expect(filterTemplatesByQuery(templates, '')).toHaveLength(3);
    expect(filterTemplatesByQuery(templates, '   ')).toHaveLength(3);
  });

  it('matches against template name (case-insensitive)', () => {
    expect(filterTemplatesByQuery(templates, 'FLIGHT').map(t => t.id)).toEqual(['a']);
  });

  it('does not match against template body (web searches by name only)', () => {
    expect(filterTemplatesByQuery(templates, 'shipped')).toHaveLength(0);
  });
});

describe('header helpers', () => {
  it('hasMediaHeader is true for image/video/document, false otherwise', () => {
    expect(hasMediaHeader(normalized({ header: { format: 'IMAGE' } }))).toBe(true);
    expect(hasMediaHeader(normalized({ header: { format: 'VIDEO' } }))).toBe(true);
    expect(hasMediaHeader(normalized({ header: { format: 'DOCUMENT' } }))).toBe(true);
    expect(hasMediaHeader(normalized({ header: { format: 'TEXT' } }))).toBe(false);
    expect(hasMediaHeader(normalized())).toBe(false);
  });

  it('isDocumentHeader only for document headers', () => {
    expect(isDocumentHeader(normalized({ header: { format: 'DOCUMENT' } }))).toBe(true);
    expect(isDocumentHeader(normalized({ header: { format: 'IMAGE' } }))).toBe(false);
  });

  it('getMediaType lowercases the header format', () => {
    expect(getMediaType(normalized({ header: { format: 'IMAGE' } }))).toBe('image');
    expect(getMediaType(normalized({ header: { format: 'DOCUMENT' } }))).toBe('document');
    expect(getMediaType(normalized())).toBe('');
  });
});

describe('extractFilenameFromUrl', () => {
  it('returns the last path segment', () => {
    expect(extractFilenameFromUrl('https://cdn.example.com/a/b/invoice.pdf')).toBe('invoice.pdf');
  });

  it('strips query strings', () => {
    expect(extractFilenameFromUrl('https://cdn.example.com/files/report.pdf?token=1')).toBe(
      'report.pdf',
    );
  });

  it('returns the input when it is not a parseable url', () => {
    expect(extractFilenameFromUrl('not a url')).toBe('not a url');
  });
});

// Mirrors web isFormInvalid (inverted) for both platforms.
describe('isTemplateComplete', () => {
  it('whatsapp: valid when no variables and no media header', () => {
    expect(isTemplateComplete(normalized({ variables: [] }), formState())).toBe(true);
  });

  it('whatsapp: requires every body variable to be filled', () => {
    const template = normalized({ variables: ['1', '2'] });
    expect(isTemplateComplete(template, formState({ bodyValues: { '1': 'A' } }))).toBe(false);
    expect(isTemplateComplete(template, formState({ bodyValues: { '1': 'A', '2': 'B' } }))).toBe(
      true,
    );
  });

  it('whatsapp: requires a media url for media header templates', () => {
    const template = normalized({ variables: ['1'], header: { format: 'IMAGE' } });
    expect(isTemplateComplete(template, formState({ bodyValues: { '1': 'A' } }))).toBe(false);
    expect(
      isTemplateComplete(
        template,
        formState({ bodyValues: { '1': 'A' }, mediaUrl: 'https://x/y.png' }),
      ),
    ).toBe(true);
  });

  it('whatsapp: requires every button parameter to be filled', () => {
    const template = normalized({
      variables: ['1'],
      buttons: [{ index: 1, type: 'copy_code' }],
    });
    expect(isTemplateComplete(template, formState({ bodyValues: { '1': 'A' } }))).toBe(false);
    expect(
      isTemplateComplete(
        template,
        formState({ bodyValues: { '1': 'A' }, buttonValues: { 1: 'CODE' } }),
      ),
    ).toBe(true);
  });

  it('twilio: requires body variables and media variable when present', () => {
    const template = normalized({
      platform: 'twilio',
      variables: ['2'],
      isMediaTemplate: true,
      mediaVariableKey: '1',
    });
    expect(isTemplateComplete(template, formState({ bodyValues: { '2': 'x' } }))).toBe(false);
    expect(
      isTemplateComplete(
        template,
        formState({ bodyValues: { '2': 'x' }, mediaUrl: 'https://x/y.pdf' }),
      ),
    ).toBe(true);
  });
});

describe('buildTemplateParams (whatsapp)', () => {
  it('builds nested body params', () => {
    const template = normalized({
      id: 'sample_flight_confirmation',
      name: 'sample_flight_confirmation',
      language: 'en_US',
      category: 'UTILITY',
      namespace: 'ns-1',
      body: 'From {{1}} to {{2}}',
      variables: ['1', '2'],
    });
    expect(
      buildTemplateParams(template, formState({ bodyValues: { '1': 'NYC', '2': 'SFO' } })),
    ).toEqual({
      name: 'sample_flight_confirmation',
      category: 'UTILITY',
      language: 'en_US',
      namespace: 'ns-1',
      processed_params: { body: { '1': 'NYC', '2': 'SFO' } },
    });
  });

  it('includes header media_url/media_type (raw url, not trimmed)', () => {
    const template = normalized({ header: { format: 'IMAGE' }, body: '{{1}}', variables: ['1'] });
    expect(
      buildTemplateParams(
        template,
        formState({ bodyValues: { '1': 'A' }, mediaUrl: 'https://example.com/img.png' }),
      ),
    ).toEqual({
      name: 't',
      category: undefined,
      language: 'en',
      namespace: undefined,
      processed_params: {
        body: { '1': 'A' },
        header: { media_url: 'https://example.com/img.png', media_type: 'image' },
      },
    });
  });

  it('includes media_name for document headers', () => {
    const template = normalized({
      header: { format: 'DOCUMENT' },
      body: '{{1}}',
      variables: ['1'],
    });
    const params = buildTemplateParams(
      template,
      formState({
        bodyValues: { '1': 'A' },
        mediaUrl: 'https://example.com/doc.pdf',
        mediaName: 'invoice.pdf',
      }),
    );
    expect(params.processed_params).toEqual({
      body: { '1': 'A' },
      header: {
        media_url: 'https://example.com/doc.pdf',
        media_type: 'document',
        media_name: 'invoice.pdf',
      },
    });
  });

  it('builds a sparse buttons array indexed by button position', () => {
    const template = normalized({
      body: '{{1}}',
      variables: ['1'],
      buttons: [
        { index: 1, type: 'url', url: 'https://x.com/{{1}}', variables: ['1'] },
        { index: 2, type: 'copy_code' },
      ],
    });
    const params = buildTemplateParams(
      template,
      formState({ bodyValues: { '1': 'A' }, buttonValues: { 1: 'devi', 2: 'CODE' } }),
    );
    const buttons = (params.processed_params as { buttons: unknown[] }).buttons;
    expect(buttons[0]).toBeUndefined();
    expect(buttons[1]).toEqual({
      type: 'url',
      parameter: 'devi',
      url: 'https://x.com/{{1}}',
      variables: ['1'],
    });
    expect(buttons[2]).toEqual({ type: 'copy_code', parameter: 'CODE' });
  });
});

describe('buildTemplateParams (twilio)', () => {
  it('builds a flat processed_params with no category/namespace', () => {
    const template = normalized({
      platform: 'twilio',
      name: 'order_update',
      language: 'en',
      category: 'utility',
      body: 'Order {{1}} for {{2}}',
      variables: ['1', '2'],
    });
    expect(
      buildTemplateParams(template, formState({ bodyValues: { '1': 'A', '2': 'B' } })),
    ).toEqual({
      name: 'order_update',
      language: 'en',
      processed_params: { '1': 'A', '2': 'B' },
    });
  });

  it('reduces the media variable value to a filename', () => {
    const template = normalized({
      platform: 'twilio',
      name: 'media_template',
      language: 'en',
      body: 'File {{2}}',
      variables: ['2'],
      isMediaTemplate: true,
      mediaVariableKey: '1',
    });
    expect(
      buildTemplateParams(
        template,
        formState({ bodyValues: { '2': 'B' }, mediaUrl: 'https://cdn.example.com/x/invoice.pdf' }),
      ),
    ).toEqual({
      name: 'media_template',
      language: 'en',
      processed_params: { '2': 'B', '1': 'invoice.pdf' },
    });
  });
});

describe('buildTemplateSendPayload', () => {
  it('renders the message and builds params together', () => {
    const template = normalized({ body: 'Hi {{1}}', variables: ['1'] });
    const payload = buildTemplateSendPayload(template, formState({ bodyValues: { '1': 'Devi' } }));
    expect(payload.message).toBe('Hi Devi');
    expect(payload.templateParams.processed_params).toEqual({ body: { '1': 'Devi' } });
  });
});
