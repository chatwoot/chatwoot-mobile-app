import { createContext, useContext } from 'react';

import { Conversation } from '@/types';
import { User } from '@/types/User';

export type SplitViewContextValue = {
  selectedConversationId: number | null;
  openConversation: (conversationId: number) => void;
  closeConversation: () => void;
  secondary: SecondaryColumn | null;
  isSecondaryOpen: boolean;
  openContact: () => void;
  openActions: () => void;
  openMacros: () => void;
  openCompose: () => void;
  openDashboard: (params: DashboardColumnParams) => void;
  closeSecondary: () => void;
};

export type DashboardColumnParams = {
  url: string;
  title?: string;
  conversation: Conversation;
  currentUser: User | null;
};

export type SecondaryColumn =
  | { kind: 'contact' }
  | { kind: 'actions' }
  | { kind: 'macros' }
  | { kind: 'compose' }
  | ({ kind: 'dashboard' } & DashboardColumnParams);

export const SplitViewContext = createContext<SplitViewContextValue | null>(null);
export const DetailPaneContext = createContext(false);

export const useSplitView = () => useContext(SplitViewContext);

export const useIsInDetailPane = () => useContext(DetailPaneContext);
export const ContactPaneContext = createContext(false);

export const useIsInContactPane = () => useContext(ContactPaneContext);

export const ComposePaneContext = createContext(false);

export const useIsInComposePane = () => useContext(ComposePaneContext);
