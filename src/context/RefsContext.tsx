import React, { useRef } from 'react';
import PagerView from 'react-native-pager-view';
import { FlashListRef } from '@shopify/flash-list';
import { Message } from '@/types';
import type { SheetRef } from '@/components-next/common/sheet/Sheet';

interface RefsContextType {
  userAvailabilityStatusSheetRef: React.RefObject<SheetRef | null>;
  filtersModalSheetRef: React.RefObject<SheetRef | null>;
  actionsModalSheetRef: React.RefObject<SheetRef | null>;
  languagesModalSheetRef: React.RefObject<SheetRef | null>;
  chatPagerView: React.RefObject<PagerView | null>;
  addLabelSheetRef: React.RefObject<SheetRef | null>;
  macrosListSheetRef: React.RefObject<SheetRef | null>;
  notificationPreferencesSheetRef: React.RefObject<SheetRef | null>;
  switchAccountSheetRef: React.RefObject<SheetRef | null>;
  debugActionsSheetRef: React.RefObject<SheetRef | null>;
  messageListRef: React.RefObject<FlashListRef<Message | { date: string }> | null>;
  inboxFiltersSheetRef: React.RefObject<SheetRef | null>;
  slaEventsSheetRef: React.RefObject<SheetRef | null>;
  deliveryStatusSheetRef: React.RefObject<SheetRef | null>;
  updateParticipantSheetRef: React.RefObject<SheetRef | null>;
  toneSelectionSheetRef: React.RefObject<SheetRef | null>;
  whatsAppTemplatesSheetRef: React.RefObject<SheetRef | null>;
}

const RefsContext = React.createContext<RefsContextType | undefined>(undefined);

const useRefsContext = (): RefsContextType => {
  const context = React.useContext(RefsContext);
  if (!context) {
    throw new Error(
      'useRefsContext: `RefsContext` is undefined. Seems you forgot to wrap component within the RefsProvider',
    );
  }

  return context;
};

const RefsProvider: React.FC<Partial<RefsContextType & { children: React.ReactNode }>> = props => {
  const userAvailabilityStatusSheetRef = useRef<SheetRef>(null);
  const filtersModalSheetRef = useRef<SheetRef>(null);
  const actionsModalSheetRef = useRef<SheetRef>(null);
  const languagesModalSheetRef = useRef<SheetRef>(null);
  const notificationPreferencesSheetRef = useRef<SheetRef>(null);
  const addLabelSheetRef = useRef<SheetRef>(null);
  const macrosListSheetRef = useRef<SheetRef>(null);
  const chatPagerView = useRef<PagerView>(null);
  const switchAccountSheetRef = useRef<SheetRef>(null);
  const debugActionsSheetRef = useRef<SheetRef>(null);
  const inboxFiltersSheetRef = useRef<SheetRef>(null);
  const messageListRef = useRef<FlashListRef<Message | { date: string }>>(null);
  const slaEventsSheetRef = useRef<SheetRef>(null);
  const deliveryStatusSheetRef = useRef<SheetRef>(null);
  const updateParticipantSheetRef = useRef<SheetRef>(null);
  const toneSelectionSheetRef = useRef<SheetRef>(null);
  const whatsAppTemplatesSheetRef = useRef<SheetRef>(null);

  const { children } = props;

  const contextRefValues = {
    userAvailabilityStatusSheetRef,
    filtersModalSheetRef,
    actionsModalSheetRef,
    languagesModalSheetRef,
    notificationPreferencesSheetRef,
    chatPagerView,
    addLabelSheetRef,
    macrosListSheetRef,
    switchAccountSheetRef,
    debugActionsSheetRef,
    inboxFiltersSheetRef,
    messageListRef,
    slaEventsSheetRef,
    deliveryStatusSheetRef,
    updateParticipantSheetRef,
    toneSelectionSheetRef,
    whatsAppTemplatesSheetRef,
  };

  return <RefsContext.Provider value={contextRefValues}>{children}</RefsContext.Provider>;
};

export { RefsProvider, useRefsContext };
