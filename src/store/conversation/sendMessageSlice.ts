import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Asset } from 'react-native-image-picker';
import { Message } from '@/types';
import { RootState } from '@/store';

export type EmailDraft = {
  conversationId: number | null;
  sourceMessageId: number | null;
  to: string;
  cc: string;
  bcc: string;
};

const emptyEmailDraft: EmailDraft = {
  conversationId: null,
  sourceMessageId: null,
  to: '',
  cc: '',
  bcc: '',
};

export type SetMessageContentPayload = {
  conversationId?: number;
  messageContent: string;
};

export type ResetSentMessagePayload = {
  conversationId?: number;
};

interface SendMessageState {
  emailDraft: EmailDraft;
  messageContent: string;
  drafts: Record<number, string>;
  isPrivateMessage: boolean;
  attachments: Asset[];
  quoteMessage: Message | null;
}

const initialState: SendMessageState = {
  emailDraft: emptyEmailDraft,
  messageContent: '',
  drafts: {},
  isPrivateMessage: false,
  attachments: [],
  quoteMessage: null,
};

const sendMessageSlice = createSlice({
  name: 'sendMessage',
  initialState,
  reducers: {
    setEmailDraft: (state, action: PayloadAction<EmailDraft>) => {
      state.emailDraft = action.payload;
    },
    updateEmailDraft: (
      state,
      action: PayloadAction<
        { conversationId: number } & Partial<Pick<EmailDraft, 'to' | 'cc' | 'bcc'>>
      >,
    ) => {
      const { conversationId, ...fields } = action.payload;
      const base =
        state.emailDraft.conversationId === conversationId
          ? state.emailDraft
          : { ...emptyEmailDraft, conversationId };
      state.emailDraft = { ...base, ...fields };
    },
    clearEmailRecipients: state => {
      state.emailDraft = { ...state.emailDraft, to: '', cc: '', bcc: '' };
    },
    setMessageContent: (state, action: PayloadAction<string | SetMessageContentPayload>) => {
      if (typeof action.payload === 'string') {
        state.messageContent = action.payload;
      } else {
        const { conversationId, messageContent } = action.payload;
        if (conversationId) {
          state.drafts[conversationId] = messageContent;
        }
        state.messageContent = messageContent;
      }
    },
    clearDraft: (state, action: PayloadAction<number>) => {
      delete state.drafts[action.payload];
      state.messageContent = '';
    },
    togglePrivateMessage: (state, action: PayloadAction<boolean>) => {
      state.isPrivateMessage = action.payload;
    },
    updateAttachments: (state, action: PayloadAction<Asset[]>) => {
      state.attachments = [...state.attachments, ...action.payload];
    },
    deleteAttachment: (state, action: PayloadAction<number>) => {
      state.attachments.splice(action.payload, 1);
    },
    resetAttachments: state => {
      state.attachments = [];
    },
    setQuoteMessage: (state, action: PayloadAction<Message | null>) => {
      state.quoteMessage = action.payload;
    },
    resetSentMessage: {
      reducer: (state, action: PayloadAction<ResetSentMessagePayload | undefined>) => {
        state.attachments = [];
        state.quoteMessage = null;
        state.messageContent = '';
        if (action.payload?.conversationId) {
          delete state.drafts[action.payload.conversationId];
        } else {
          state.drafts = {};
        }
      },
      prepare: (payload?: ResetSentMessagePayload) => ({ payload }),
    },
  },
});

export const selectEmailDraft = (state: RootState) =>
  state.sendMessage.emailDraft ?? emptyEmailDraft;
export const selectDrafts = (state: RootState) => state.sendMessage.drafts ?? {};
export const selectMessageContent = (state: RootState) => state.sendMessage.messageContent;
export const selectMessageContentByConversationId =
  (conversationId?: number) =>
  (state: RootState): string => {
    if (!conversationId) {
      return state.sendMessage.messageContent || '';
    }
    return state.sendMessage.drafts?.[conversationId] ?? '';
  };
export const selectIsPrivateMessage = (state: RootState) => state.sendMessage.isPrivateMessage;
export const selectAttachments = (state: RootState) => state.sendMessage.attachments;
export const selectQuoteMessage = (state: RootState) => state.sendMessage.quoteMessage;
export const selectQuoteMessageByConversationId =
  (conversationId?: number) =>
  (state: RootState): Message | null => {
    const quote = state.sendMessage.quoteMessage;
    if (!quote || !conversationId) return quote;
    return quote.conversationId === conversationId ? quote : null;
  };

export const {
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
} = sendMessageSlice.actions;

export default sendMessageSlice.reducer;
