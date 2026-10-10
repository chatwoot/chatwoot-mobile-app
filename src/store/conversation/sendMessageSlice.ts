import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Asset } from 'react-native-image-picker';
import { Message } from '@/types';
import { RootState } from '@/store';

export interface SendMessageState {
  // Unsent reply text keyed by conversation id, so every conversation keeps its own draft
  drafts: Record<number, string>;
  isPrivateMessage: boolean;
  attachments: Asset[];
  quoteMessage: Message | null;
}

const initialState: SendMessageState = {
  drafts: {},
  isPrivateMessage: false,
  attachments: [],
  quoteMessage: null,
};

const sendMessageSlice = createSlice({
  name: 'sendMessage',
  initialState,
  reducers: {
    setMessageContent: (
      state,
      action: PayloadAction<{ conversationId: number; content: string }>,
    ) => {
      const { conversationId, content } = action.payload;
      // Installs upgraded from the single global draft have no drafts map persisted yet
      if (!state.drafts) {
        state.drafts = {};
      }
      // Drop empty drafts so the persisted map only holds conversations with unsent text
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

export const selectMessageContent = (state: RootState, conversationId: number) =>
  state.sendMessage.drafts?.[conversationId] ?? '';
export const selectIsPrivateMessage = (state: RootState) => state.sendMessage.isPrivateMessage;
export const selectAttachments = (state: RootState) => state.sendMessage.attachments;
export const selectQuoteMessage = (state: RootState) => state.sendMessage.quoteMessage;

export const {
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
