import type { Inbox } from '@/types/Inbox';
import type { WhatsAppMessageTemplate } from '@/types/MessageTemplate';
import {
  allVariablesFilled,
  buildTemplateParams,
  extractVariables,
  getTemplatesForInbox,
  isWhatsAppTextOnlyTemplate,
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

describe('isWhatsAppTextOnlyTemplate', () => {
  it('accepts approved text-body templates', () => {
    expect(isWhatsAppTextOnlyTemplate(baseTemplate())).toBe(true);
  });

  it('rejects non-approved templates', () => {
    expect(isWhatsAppTextOnlyTemplate(baseTemplate({ status: 'pending' }))).toBe(false);
  });

  it('rejects AUTHENTICATION category', () => {
    expect(isWhatsAppTextOnlyTemplate(baseTemplate({ category: 'AUTHENTICATION' }))).toBe(false);
  });

  it('rejects CSAT survey templates by name prefix', () => {
    expect(
      isWhatsAppTextOnlyTemplate(baseTemplate({ name: 'customer_satisfaction_survey_v1' })),
    ).toBe(false);
  });

  it('rejects templates with media header', () => {
    expect(
      isWhatsAppTextOnlyTemplate(
        baseTemplate({
          components: [
            { type: 'HEADER', format: 'IMAGE' },
            { type: 'BODY', text: 'Hi {{1}}' },
          ],
        }),
      ),
    ).toBe(false);
  });

  it('rejects templates with buttons', () => {
    expect(
      isWhatsAppTextOnlyTemplate(
        baseTemplate({
          components: [
            { type: 'BODY', text: 'Hi {{1}}' },
            { type: 'BUTTONS', buttons: [{ type: 'QUICK_REPLY', text: 'Yes' }] },
          ],
        }),
      ),
    ).toBe(false);
  });

  it('accepts templates with a TEXT header', () => {
    expect(
      isWhatsAppTextOnlyTemplate(
        baseTemplate({
          components: [
            { type: 'HEADER', format: 'TEXT', text: 'Header' },
            { type: 'BODY', text: 'Hi {{1}}' },
          ],
        }),
      ),
    ).toBe(true);
  });
});

describe('getTemplatesForInbox', () => {
  it('returns whatsapp message templates normalized', () => {
    const inbox = {
      messageTemplates: [baseTemplate()],
    } as Inbox;
    const templates = getTemplatesForInbox(inbox);
    expect(templates).toHaveLength(1);
    expect(templates[0]).toMatchObject({
      id: 'sample_flight_confirmation',
      name: 'sample_flight_confirmation',
      platform: 'whatsapp',
      language: 'en_US',
      variables: ['1', '2', '3'],
    });
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

describe('allVariablesFilled', () => {
  const template = {
    id: 't',
    name: 't',
    platform: 'whatsapp' as const,
    language: 'en',
    body: 'Hi {{1}} {{2}}',
    variables: ['1', '2'],
  };

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

describe('buildTemplateParams', () => {
  it('builds the payload shape expected by the backend processor', () => {
    const template = {
      id: 'sample_flight_confirmation',
      name: 'sample_flight_confirmation',
      platform: 'whatsapp' as const,
      language: 'en_US',
      category: 'UTILITY',
      namespace: 'ns-1',
      body: 'From {{1}} to {{2}}',
      variables: ['1', '2'],
    };
    expect(buildTemplateParams(template, { '1': 'NYC', '2': 'SFO' })).toEqual({
      name: 'sample_flight_confirmation',
      category: 'UTILITY',
      language: 'en_US',
      namespace: 'ns-1',
      processed_params: { body: { '1': 'NYC', '2': 'SFO' } },
    });
  });

  it('handles missing values as empty strings', () => {
    const template = {
      id: 't',
      name: 't',
      platform: 'whatsapp' as const,
      language: 'en',
      body: '{{1}}',
      variables: ['1'],
    };
    expect(buildTemplateParams(template, {})).toEqual({
      name: 't',
      category: undefined,
      language: 'en',
      namespace: undefined,
      processed_params: { body: { '1': '' } },
    });
  });
});
