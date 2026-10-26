import { createContext, useContext } from 'react';

export type SplitViewContextValue = {
  selectedConversationId: number | null;
  openConversation: (conversationId: number) => void;
  // Clears the conversation pane back to its empty state.
  closeConversation: () => void;
};

export const SplitViewContext = createContext<SplitViewContextValue | null>(null);
export const DetailPaneContext = createContext(false);

/** Set when the list is shown next to a conversation pane; rows open chats there. */
export const useSplitView = () => useContext(SplitViewContext);

/** True for components rendered inside the conversation pane of a split view. */
export const useIsInDetailPane = () => useContext(DetailPaneContext);
