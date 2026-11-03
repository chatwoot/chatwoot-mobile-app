import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Asset } from 'react-native-image-picker';
import { Message } from '@/types';
import { RootState } from '@/store';

// Email recipients for the reply being written. Kept here (not in the reply bar) so the
// draft carries over between the reply bar and the compose column on iPhone Duo.
export type EmailDraft = {
  conversationId: number | null;
  // The email the recipients were filled in from; a newer email refills them.
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

interface SendMessageState {
  emailDraft: EmailDraft;
  messageContent: string;
  isPrivateMessage: boolean;
  attachments: Asset[];
  quoteMessage: Message | null;
}

const initialState: SendMessageState = {
  emailDraft: emptyEmailDraft,
  messageContent: '',
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
    // Edits one or more recipient fields; switching conversation starts from empty fields.
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
    setMessageContent: (state, action: PayloadAction<string>) => {
      state.messageContent = action.payload;
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
    resetSentMessage: state => {
      state.attachments = [];
      state.quoteMessage = null;
      state.messageContent = '';
    },
  },
});

export const selectEmailDraft = (state: RootState) =>
  state.sendMessage.emailDraft ?? emptyEmailDraft;
export const selectMessageContent = (state: RootState) => state.sendMessage.messageContent;
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
} = sendMessageSlice.actions;

export default sendMessageSlice.reducer;
