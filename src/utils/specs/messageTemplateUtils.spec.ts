import type { Inbox } from '@/types/Inbox';
import type { NormalizedTemplate, WhatsAppMessageTemplate } from '@/types/MessageTemplate';
import {
  allVariablesFilled,
  buildTemplateParams,
  canSendTemplate,
  extractVariables,
  filterTemplatesByQuery,
  getHeaderSubtitle,
  getTemplatesForInbox,
  isSendableTemplate,
  renderTemplateLabel,
  renderTemplatePreview,
  requiresImageUrl,
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

describe('isSendableTemplate', () => {
  it('accepts approved text-body templates', () => {
    expect(isSendableTemplate(baseTemplate())).toBe(true);
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

  it('accepts templates with media header', () => {
    expect(
      isSendableTemplate(
        baseTemplate({
          components: [
            { type: 'HEADER', format: 'IMAGE' },
            { type: 'BODY', text: 'Hi {{1}}' },
          ],
        }),
      ),
    ).toBe(true);
  });

  it('accepts templates with buttons', () => {
    expect(
      isSendableTemplate(
        baseTemplate({
          components: [
            { type: 'BODY', text: 'Hi {{1}}' },
            { type: 'BUTTONS', buttons: [{ type: 'QUICK_REPLY', text: 'Yes' }] },
          ],
        }),
      ),
    ).toBe(true);
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
    expect(
      isSendableTemplate(baseTemplate({ status: '' as unknown as string })),
    ).toBe(false);
    expect(
      isSendableTemplate(baseTemplate({ components: undefined as unknown as never })),
    ).toBe(false);
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

  it('returns twilio content templates normalized', () => {
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
        ],
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

  it('returns empty array for inbox with no templates', () => {
    expect(getTemplatesForInbox({} as Inbox)).toEqual([]);
    expect(getTemplatesForInbox(undefined)).toEqual([]);
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
    normalized({
      id: 'c',
      name: 'delivery_failed',
      body: 'Could not deliver',
      actions: ['Call us'],
    }),
  ];

  it('returns all templates for an empty query', () => {
    expect(filterTemplatesByQuery(templates, '')).toHaveLength(3);
    expect(filterTemplatesByQuery(templates, '   ')).toHaveLength(3);
  });

  it('matches against template name (case-insensitive)', () => {
    expect(filterTemplatesByQuery(templates, 'FLIGHT').map(t => t.id)).toEqual(['a']);
  });

  it('matches against template body', () => {
    expect(filterTemplatesByQuery(templates, 'shipped').map(t => t.id)).toEqual(['b']);
  });

  it('matches against action button labels', () => {
    expect(filterTemplatesByQuery(templates, 'call us').map(t => t.id)).toEqual(['c']);
  });
});

describe('canSendTemplate', () => {
  it('returns true when all body vars are filled and no image is required', () => {
    expect(canSendTemplate(normalized({ variables: ['1'] }), { '1': 'A' }, '')).toBe(true);
  });

  it('returns false when a body var is missing', () => {
    expect(canSendTemplate(normalized({ variables: ['1'] }), {}, '')).toBe(false);
  });

  it('returns false when image header template has no URL', () => {
    expect(
      canSendTemplate(
        normalized({ variables: ['1'], header: { format: 'IMAGE' } }),
        { '1': 'A' },
        '',
      ),
    ).toBe(false);
  });

  it('returns true when image header template has a URL', () => {
    expect(
      canSendTemplate(
        normalized({ variables: ['1'], header: { format: 'IMAGE' } }),
        { '1': 'A' },
        'https://example.com/img.png',
      ),
    ).toBe(true);
  });
});

describe('allVariablesFilled', () => {
  const template = normalized({ body: 'Hi {{1}} {{2}}', variables: ['1', '2'] });

  it('returns true when every variable has a non-empty value', () => {
    expect(allVariablesFilled(template, { '1': 'A', '2': 'B' })).toBe(true);
  });

  it('returns false when a variable is missing', () => {
    expect(allVariablesFilled(template, { '1': 'A' })).toBe(false);
  });

  it('returns false when a variable value is whitespace only', () => {
    expect(allVariablesFilled(template, { '1': 'A', '2': '   ' })).toBe(false);
  });
});

describe('requiresImageUrl', () => {
  it('returns true for image header templates', () => {
    expect(requiresImageUrl(normalized({ header: { format: 'IMAGE' } }))).toBe(true);
  });

  it('returns false for text, video, document headers', () => {
    expect(requiresImageUrl(normalized({ header: { format: 'TEXT' } }))).toBe(false);
    expect(requiresImageUrl(normalized({ header: { format: 'VIDEO' } }))).toBe(false);
    expect(requiresImageUrl(normalized({ header: { format: 'DOCUMENT' } }))).toBe(false);
  });

  it('returns false when no header', () => {
    expect(requiresImageUrl(normalized())).toBe(false);
  });
});

describe('buildTemplateParams', () => {
  it('builds the payload shape expected by the backend processor', () => {
    const template = normalized({
      id: 'sample_flight_confirmation',
      name: 'sample_flight_confirmation',
      language: 'en_US',
      category: 'UTILITY',
      namespace: 'ns-1',
      body: 'From {{1}} to {{2}}',
      variables: ['1', '2'],
    });
    expect(buildTemplateParams(template, { '1': 'NYC', '2': 'SFO' })).toEqual({
      name: 'sample_flight_confirmation',
      category: 'UTILITY',
      language: 'en_US',
      namespace: 'ns-1',
      processed_params: { body: { '1': 'NYC', '2': 'SFO' } },
    });
  });

  it('handles missing values as empty strings', () => {
    const template = normalized({ body: '{{1}}', variables: ['1'] });
    expect(buildTemplateParams(template, {})).toEqual({
      name: 't',
      category: undefined,
      language: 'en',
      namespace: undefined,
      processed_params: { body: { '1': '' } },
    });
  });

  it('includes header.media_url and media_type for image header templates', () => {
    const template = normalized({
      header: { format: 'IMAGE' },
      body: '{{1}}',
      variables: ['1'],
    });
    expect(buildTemplateParams(template, { '1': 'A' }, '  https://example.com/img.png  ')).toEqual({
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

  it('does not include header for non-image templates even if URL passed', () => {
    const template = normalized({ body: '{{1}}', variables: ['1'] });
    expect(buildTemplateParams(template, { '1': 'A' }, 'https://example.com/img.png')).toEqual({
      name: 't',
      category: undefined,
      language: 'en',
      namespace: undefined,
      processed_params: { body: { '1': 'A' } },
    });
  });
});
