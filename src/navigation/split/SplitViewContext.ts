import { createContext, useContext } from 'react';

export type SplitViewContextValue = {
  selectedConversationId: number | null;
  openConversation: (conversationId: number) => void;
  // Clears the conversation pane back to its empty state.
  closeConversation: () => void;
  // A secondary column (contact details, conversation actions or a dashboard app): the list
  // slides away, the conversation narrows on the left and the column opens on the right.
  secondary: SecondaryColumn | null;
  isSecondaryOpen: boolean;
  openContact: () => void;
  openActions: () => void;
  openDashboard: (params: DashboardColumnParams) => void;
  closeSecondary: () => void;
};

export type DashboardColumnParams = {
  url: string;
  title?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conversation: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentUser: any;
};

export type SecondaryColumn =
  | { kind: 'contact' }
  | { kind: 'actions' }
  | ({ kind: 'dashboard' } & DashboardColumnParams);

export const SplitViewContext = createContext<SplitViewContextValue | null>(null);
export const DetailPaneContext = createContext(false);

/** Set when the list is shown next to a conversation pane; rows open chats there. */
export const useSplitView = () => useContext(SplitViewContext);

/** True for components rendered inside the conversation pane of a split view. */
export const useIsInDetailPane = () => useContext(DetailPaneContext);
export const ContactPaneContext = createContext(false);

/** True inside the contact details column of the split view. */
export const useIsInContactPane = () => useContext(ContactPaneContext);
