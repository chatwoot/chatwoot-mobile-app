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

export interface SendMessageState {
  emailDraft: EmailDraft;
  // Keyed by conversation id
  drafts: Record<number, string>;
  isPrivateMessage: boolean;
  attachments: Asset[];
  quoteMessage: Message | null;
}

const initialState: SendMessageState = {
  emailDraft: emptyEmailDraft,
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
    setMessageContent: (
      state,
      action: PayloadAction<{ conversationId: number; content: string }>,
    ) => {
      const { conversationId, content } = action.payload;
      // Persisted state may lack drafts
      if (!state.drafts) {
        state.drafts = {};
      }
      if (content) {
        state.drafts[conversationId] = content;
      } else {
        delete state.drafts[conversationId];
      }
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
    resetSentMessage: (state, action: PayloadAction<number>) => {
      state.attachments = [];
      state.quoteMessage = null;
      if (state.drafts) {
        delete state.drafts[action.payload];
      }
    },
    resetSendMessageState: () => initialState,
  },
});

export const selectEmailDraft = (state: RootState) =>
  state.sendMessage.emailDraft ?? emptyEmailDraft;
export const selectMessageContent = (state: RootState, conversationId: number) =>
  state.sendMessage.drafts?.[conversationId] ?? '';
export const selectIsPrivateMessage = (state: RootState) => state.sendMessage.isPrivateMessage;
export const selectAttachments = (state: RootState) => state.sendMessage.attachments;
export const selectQuoteMessage = (state: RootState) => state.sendMessage.quoteMessage;

export const {
  setEmailDraft,
  updateEmailDraft,
  clearEmailRecipients,
  setMessageContent,
  togglePrivateMessage,
  updateAttachments,
  deleteAttachment,
  resetAttachments,
  setQuoteMessage,
  resetSentMessage,
  resetSendMessageState,
} = sendMessageSlice.actions;

export default sendMessageSlice.reducer;
