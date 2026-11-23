import { RootState } from '@/store';
import reducer, {
  setEmailDraft,
  updateEmailDraft,
  clearEmailRecipients,
  setMessageContent,
  clearDraft,
  togglePrivateMessage,
  updateAttachments,
  deleteAttachment,
  resetAttachments,
  setQuoteMessage,
  resetSentMessage,
  selectDrafts,
  selectMessageContent,
  selectMessageContentByConversationId,
  selectQuoteMessage,
  selectQuoteMessageByConversationId,
  selectEmailDraft,
  selectIsPrivateMessage,
  selectAttachments,
  EmailDraft,
} from '../sendMessageSlice';
import { Message } from '@/types';
import { Asset } from 'react-native-image-picker';

describe('sendMessageSlice', () => {
  const emptyEmailDraft: EmailDraft = {
    conversationId: null,
    sourceMessageId: null,
    to: '',
    cc: '',
    bcc: '',
  };

  const initialState = {
    emailDraft: emptyEmailDraft,
    messageContent: '',
    drafts: {},
    isPrivateMessage: false,
    attachments: [],
    quoteMessage: null,
  };

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setMessageContent and draft keying', () => {
    it('should set message content when passed a plain string', () => {
      const state = reducer(initialState, setMessageContent('Hello world'));
      expect(state.messageContent).toBe('Hello world');
      expect(state.drafts).toEqual({});
    });

    it('should set message content and store draft under conversationId', () => {
      const state = reducer(
        initialState,
        setMessageContent({ conversationId: 101, messageContent: 'Draft for conversation 101' }),
      );
      expect(state.messageContent).toBe('Draft for conversation 101');
      expect(state.drafts[101]).toBe('Draft for conversation 101');
    });

    it('should keep separate drafts for distinct conversations', () => {
      let state = reducer(
        initialState,
        setMessageContent({ conversationId: 101, messageContent: 'Draft A' }),
      );
      state = reducer(state, setMessageContent({ conversationId: 202, messageContent: 'Draft B' }));

      expect(state.drafts[101]).toBe('Draft A');
      expect(state.drafts[202]).toBe('Draft B');
    });

    it('should clear draft for a specific conversation using clearDraft', () => {
      let state = reducer(
        initialState,
        setMessageContent({ conversationId: 101, messageContent: 'Draft A' }),
      );
      state = reducer(state, setMessageContent({ conversationId: 202, messageContent: 'Draft B' }));

      state = reducer(state, clearDraft(101));
      expect(state.drafts[101]).toBeUndefined();
      expect(state.drafts[202]).toBe('Draft B');
    });
  });

  describe('resetSentMessage', () => {
    it('should reset only the specified conversation draft and message attachments on sent', () => {
      const stateWithDrafts: ReturnType<typeof reducer> = {
        ...initialState,
        messageContent: 'Draft A',
        drafts: {
          101: 'Draft A',
          202: 'Draft B',
        },
        attachments: [{ fileName: 'photo.jpg' } as Asset],
        quoteMessage: { id: 1 } as Message,
      };

      const state = reducer(stateWithDrafts, resetSentMessage({ conversationId: 101 }));

      expect(state.drafts[101]).toBeUndefined();
      expect(state.drafts[202]).toBe('Draft B');
      expect(state.messageContent).toBe('');
      expect(state.attachments).toEqual([]);
      expect(state.quoteMessage).toBeNull();
    });

    it('should reset all drafts and state when called without conversationId (e.g. account switch)', () => {
      const stateWithDrafts: ReturnType<typeof reducer> = {
        ...initialState,
        messageContent: 'Current draft',
        drafts: {
          101: 'Draft A',
          202: 'Draft B',
        },
        attachments: [{ fileName: 'photo.jpg' } as Asset],
      };

      const state = reducer(stateWithDrafts, resetSentMessage());

      expect(state.drafts).toEqual({});
      expect(state.messageContent).toBe('');
      expect(state.attachments).toEqual([]);
      expect(state.quoteMessage).toBeNull();
    });
  });

  describe('selectors', () => {
    const mockRootState = {
      sendMessage: {
        emailDraft: {
          conversationId: 101,
          sourceMessageId: 12,
          to: 'customer@example.com',
          cc: '',
          bcc: '',
        },
        messageContent: 'Fallback content',
        drafts: {
          101: 'Conversation 101 draft text',
          202: 'Conversation 202 draft text',
        },
        isPrivateMessage: true,
        attachments: [{ fileName: 'doc.pdf' } as Asset],
        quoteMessage: {
          id: 55,
          conversationId: 101,
          content: 'Quoted message',
        } as Message,
      },
    } as unknown as RootState;

    it('selectDrafts returns all drafts', () => {
      expect(selectDrafts(mockRootState)).toEqual({
        101: 'Conversation 101 draft text',
        202: 'Conversation 202 draft text',
      });
    });

    it('selectMessageContentByConversationId returns conversation draft or empty string', () => {
      expect(selectMessageContentByConversationId(101)(mockRootState)).toBe(
        'Conversation 101 draft text',
      );
      expect(selectMessageContentByConversationId(202)(mockRootState)).toBe(
        'Conversation 202 draft text',
      );
      expect(selectMessageContentByConversationId(999)(mockRootState)).toBe('');
      expect(selectMessageContentByConversationId()(mockRootState)).toBe('Fallback content');
    });

    it('selectQuoteMessageByConversationId isolates quoted message to its own conversation', () => {
      expect(selectQuoteMessageByConversationId(101)(mockRootState)).toEqual(
        expect.objectContaining({ id: 55, conversationId: 101 }),
      );
      expect(selectQuoteMessageByConversationId(202)(mockRootState)).toBeNull();
      expect(selectQuoteMessageByConversationId()(mockRootState)).toEqual(
        expect.objectContaining({ id: 55 }),
      );
    });

    it('selectMessageContent, selectQuoteMessage, selectEmailDraft, selectIsPrivateMessage, selectAttachments', () => {
      expect(selectMessageContent(mockRootState)).toBe('Fallback content');
      expect(selectQuoteMessage(mockRootState)).toEqual(expect.objectContaining({ id: 55 }));
      expect(selectEmailDraft(mockRootState)).toEqual(
        expect.objectContaining({ to: 'customer@example.com' }),
      );
      expect(selectIsPrivateMessage(mockRootState)).toBe(true);
      expect(selectAttachments(mockRootState)).toHaveLength(1);
    });
  });

  describe('email draft actions', () => {
    it('sets and updates email draft', () => {
      let state = reducer(
        initialState,
        setEmailDraft({
          conversationId: 10,
          sourceMessageId: 2,
          to: 'a@b.com',
          cc: 'c@d.com',
          bcc: '',
        }),
      );
      expect(state.emailDraft.to).toBe('a@b.com');

      state = reducer(state, updateEmailDraft({ conversationId: 10, bcc: 'bcc@d.com' }));
      expect(state.emailDraft.bcc).toBe('bcc@d.com');
      expect(state.emailDraft.to).toBe('a@b.com');

      state = reducer(state, clearEmailRecipients());
      expect(state.emailDraft.to).toBe('');
      expect(state.emailDraft.cc).toBe('');
      expect(state.emailDraft.bcc).toBe('');
    });
  });

  describe('attachments and private note actions', () => {
    it('updates, deletes, and resets attachments', () => {
      const asset1 = { fileName: '1.jpg' } as Asset;
      const asset2 = { fileName: '2.jpg' } as Asset;

      let state = reducer(initialState, updateAttachments([asset1, asset2]));
      expect(state.attachments).toHaveLength(2);

      state = reducer(state, deleteAttachment(0));
      expect(state.attachments).toEqual([asset2]);

      state = reducer(state, resetAttachments());
      expect(state.attachments).toEqual([]);
    });

    it('toggles private message and sets quote message', () => {
      let state = reducer(initialState, togglePrivateMessage(true));
      expect(state.isPrivateMessage).toBe(true);

      const quote = { id: 99, conversationId: 1 } as Message;
      state = reducer(state, setQuoteMessage(quote));
      expect(state.quoteMessage).toEqual(quote);
    });
  });
});
