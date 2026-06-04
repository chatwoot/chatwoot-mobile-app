import { transformSearchConversation } from '../transformers';

describe('transformSearchConversation', () => {
  it('removes placeholder undefined email subjects from search metadata', () => {
    const conversation = transformSearchConversation({
      id: 46984,
      additional_attributes: {
        mail_subject: 'undefined',
        email_subject: '  undefined  ',
      },
    }) as {
      additionalAttributes?: {
        mailSubject?: string;
        emailSubject?: string;
      };
    };

    expect(conversation.additionalAttributes?.mailSubject).toBe('');
    expect(conversation.additionalAttributes?.emailSubject).toBe('');
  });

  it('preserves real email subjects from search metadata', () => {
    const conversation = transformSearchConversation({
      id: 46984,
      additional_attributes: {
        mail_subject: 'Retainer Inquiry',
      },
    }) as {
      additionalAttributes?: {
        mailSubject?: string;
      };
    };

    expect(conversation.additionalAttributes?.mailSubject).toBe('Retainer Inquiry');
  });
});
