import { conversationActions } from '../conversationActions';
import { ConversationService } from '../conversationService';
import type { Message } from '@/types';
import { MESSAGE_TYPES } from '@/constants';

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/utils/toastUtils', () => ({
  showToast: jest.fn(),
}));

jest.mock('../conversationService', () => ({
  ConversationService: {
    translateMessage: jest.fn(),
  },
}));

describe('conversationActions', () => {
  it('should merge translations into the message after translateMessage', async () => {
    const payload = { conversationId: 1, messageId: 10, targetLanguage: 'es' };
    const message = {
      id: payload.messageId,
      attachments: [],
      content: 'Hello',
      contentAttributes: {
        translations: {
          fr: 'Bonjour',
        },
      },
      contentType: 'text',
      conversationId: payload.conversationId,
      createdAt: 123,
      echoId: null,
      inboxId: 1,
      messageType: MESSAGE_TYPES.OUTGOING,
      private: false,
      sourceId: null,
      status: 'sent',
      lastNonActivityMessage: null,
      senderId: 1,
    } as Message;

    (ConversationService.translateMessage as jest.Mock).mockResolvedValue({
      content: 'Hola',
    });

    const dispatch = jest.fn();
    const getState = () => ({
      conversations: {
        entities: {
          [payload.conversationId]: {
            messages: [message],
          },
        },
      },
    });

    await conversationActions.translateMessage(payload)(dispatch, getState, undefined);

    expect(ConversationService.translateMessage).toHaveBeenCalledWith(payload);

    const updateAction = dispatch.mock.calls.find(
      ([action]) => action.type === 'conversation/addOrUpdateMessage',
    );

    expect(updateAction).toBeTruthy();
    expect(updateAction?.[0].payload.contentAttributes?.translations).toEqual({
      fr: 'Bonjour',
      es: 'Hola',
    });
  });
});
