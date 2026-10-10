import sendMessageReducer, {
  setMessageContent,
  setQuoteMessage,
  updateAttachments,
  resetSentMessage,
  resetSendMessageState,
  selectMessageContent,
  SendMessageState,
} from '../sendMessageSlice';
import { Asset } from 'react-native-image-picker';
import { Message } from '@/types';
import { RootState } from '@/store';

const buildRootState = (sendMessage: Partial<SendMessageState>) =>
  ({ sendMessage }) as unknown as RootState;

describe('sendMessage reducer', () => {
  it('should return initial state', () => {
    expect(sendMessageReducer(undefined, { type: '' })).toEqual({
      drafts: {},
      isPrivateMessage: false,
      attachments: [],
      quoteMessage: null,
    });
  });

  describe('setMessageContent', () => {
    it('keeps a separate draft per conversation', () => {
      let state = sendMessageReducer(
        undefined,
        setMessageContent({ conversationId: 1, content: 'Draft A' }),
      );
      state = sendMessageReducer(
        state,
        setMessageContent({ conversationId: 2, content: 'Draft B' }),
      );
      state = sendMessageReducer(
        state,
        setMessageContent({ conversationId: 1, content: 'Draft A2' }),
      );

      expect(state.drafts).toEqual({ 1: 'Draft A2', 2: 'Draft B' });
    });

    it('drops the draft when the content is cleared', () => {
      const initialState: SendMessageState = {
        drafts: { 1: 'Draft A', 2: 'Draft B' },
        isPrivateMessage: false,
        attachments: [],
        quoteMessage: null,
      };

      const state = sendMessageReducer(
        initialState,
        setMessageContent({ conversationId: 1, content: '' }),
      );

      expect(state.drafts).toEqual({ 2: 'Draft B' });
    });

    it('creates the drafts map when the persisted state predates it', () => {
      const persistedState = {
        messageContent: 'old global draft',
        isPrivateMessage: false,
        attachments: [],
        quoteMessage: null,
      } as unknown as SendMessageState;

      const state = sendMessageReducer(
        persistedState,
        setMessageContent({ conversationId: 3, content: 'Draft C' }),
      );

      expect(state.drafts).toEqual({ 3: 'Draft C' });
    });
  });

  describe('resetSentMessage', () => {
    it('clears only the sent conversation draft along with quote and attachments', () => {
      const initialState: SendMessageState = {
        drafts: { 1: 'Draft A', 2: 'Draft B' },
        isPrivateMessage: false,
        attachments: [{ uri: 'file://photo.jpg' } as Asset],
        quoteMessage: { id: 10 } as Message,
      };

      const state = sendMessageReducer(initialState, resetSentMessage(1));

      expect(state.drafts).toEqual({ 2: 'Draft B' });
      expect(state.attachments).toEqual([]);
      expect(state.quoteMessage).toBeNull();
    });

    it('does not throw when the persisted state has no drafts map', () => {
      const persistedState = { attachments: [], quoteMessage: null } as unknown as SendMessageState;

      expect(() => sendMessageReducer(persistedState, resetSentMessage(1))).not.toThrow();
    });
  });

  describe('resetSendMessageState', () => {
    it('clears every draft, quote and attachment', () => {
      let state = sendMessageReducer(
        undefined,
        setMessageContent({ conversationId: 1, content: 'Draft A' }),
      );
      state = sendMessageReducer(state, setQuoteMessage({ id: 10 } as Message));
      state = sendMessageReducer(state, updateAttachments([{ uri: 'file://photo.jpg' } as Asset]));

      expect(sendMessageReducer(state, resetSendMessageState())).toEqual(
        sendMessageReducer(undefined, { type: '' }),
      );
    });
  });
});

describe('selectMessageContent', () => {
  it('returns the draft of the given conversation', () => {
    const state = buildRootState({ drafts: { 1: 'Draft A', 2: 'Draft B' } });

    expect(selectMessageContent(state, 1)).toBe('Draft A');
    expect(selectMessageContent(state, 2)).toBe('Draft B');
  });

  it('returns an empty string when the conversation has no draft', () => {
    expect(selectMessageContent(buildRootState({ drafts: { 1: 'Draft A' } }), 2)).toBe('');
  });

  it('returns an empty string when the persisted state predates drafts', () => {
    expect(selectMessageContent(buildRootState({}), 1)).toBe('');
  });
});
