import { Asset } from 'react-native-image-picker';
import { create } from 'zustand';

import { Message } from '../types';

export type SendMessageProps = {
  messageContent: string;
  setMessageText: (text: string) => void;
  isPrivateMessage: boolean;
  togglePrivateMessage: () => void;
  attachments: Asset[];
  updateAttachments: (newAttachments: Asset[]) => void;
  deleteAttachment: (attachmentIndex: number) => void;
  resetAttachments: () => void;
  quoteMessage: Message | null; // Property for storing the quote message
  setQuoteMessage: (message: Message | null) => void; // Function to set the quote message
  resetSentMessage: () => void;
};

export const useSendMessage = create<SendMessageProps>(set => ({
  messageContent: '',
  isPrivateMessage: false,
  attachments: [],
  quoteMessage: null,
  setMessageText: (text: string) => {
    set(state => ({ ...state, messageContent: text }));
  },
  togglePrivateMessage: () => {
    set(state => ({ ...state, isPrivateMessage: !state.isPrivateMessage }));
  },
  updateAttachments: (newAttachments: Asset[]) => {
    set(state => ({
      ...state,
      attachments: [...state.attachments, ...newAttachments],
    }));
  },
  deleteAttachment: (attachmentIndex: number) => {
    set(state => {
      const updatedAttachments = [...state.attachments];
      updatedAttachments.splice(attachmentIndex, 1);
      return {
        ...state,
        attachments: updatedAttachments,
      };
    });
  },
  resetAttachments: () => {
    set(state => ({
      ...state,
      attachments: [],
    }));
  },
  setQuoteMessage: (message: Message | null) => {
    set(state => ({
      ...state,
      quoteMessage: message,
    }));
  },
  resetSentMessage: () => {
    set(state => ({
      ...state,
      attachments: [],
      quoteMessage: null,
      messageContent: '',
    }));
  },
}));
