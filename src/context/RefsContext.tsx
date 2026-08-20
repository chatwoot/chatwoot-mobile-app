import React, { useRef } from 'react';
import PagerView from 'react-native-pager-view';
import { FlashListRef } from '@shopify/flash-list';
import { Message } from '@/types';
import type { SheetRef } from '@/components-next/common/sheet/Sheet';

interface RefsContextType {
  userAvailabilityStatusSheetRef: React.RefObject<SheetRef>;
  filtersModalSheetRef: React.RefObject<SheetRef>;
  actionsModalSheetRef: React.RefObject<SheetRef>;
  languagesModalSheetRef: React.RefObject<SheetRef>;
  chatPagerView: React.RefObject<PagerView>;
  addLabelSheetRef: React.RefObject<SheetRef>;
  macrosListSheetRef: React.RefObject<SheetRef>;
  notificationPreferencesSheetRef: React.RefObject<SheetRef>;
  switchAccountSheetRef: React.RefObject<SheetRef>;
  debugActionsSheetRef: React.RefObject<SheetRef>;
  messageListRef: React.RefObject<FlashListRef<Message | { date: string }>>;
  inboxFiltersSheetRef: React.RefObject<SheetRef>;
  slaEventsSheetRef: React.RefObject<SheetRef>;
  deliveryStatusSheetRef: React.RefObject<SheetRef>;
  updateParticipantSheetRef: React.RefObject<SheetRef>;
  toneSelectionSheetRef: React.RefObject<SheetRef>;
  whatsAppTemplatesSheetRef: React.RefObject<SheetRef>;
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
