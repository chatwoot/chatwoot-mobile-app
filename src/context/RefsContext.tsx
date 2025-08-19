import React, { useRef } from 'react';
import PagerView from 'react-native-pager-view';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { Message } from '@/types';

interface RefsContextType {
  userAvailabilityStatusSheetRef: React.RefObject<BottomSheetModal>;
  filtersModalSheetRef: React.RefObject<BottomSheetModal>;
  actionsModalSheetRef: React.RefObject<BottomSheetModal>;
  languagesModalSheetRef: React.RefObject<BottomSheetModal>;
  chatPagerView: React.RefObject<PagerView>;
  addLabelSheetRef: React.RefObject<BottomSheetModal>;
  macrosListSheetRef: React.RefObject<BottomSheetModal>;
  notificationPreferencesSheetRef: React.RefObject<BottomSheetModal>;
  switchAccountSheetRef: React.RefObject<BottomSheetModal>;
  debugActionsSheetRef: React.RefObject<BottomSheetModal>;
  messageListRef: React.RefObject<FlashList<Message | { date: string }>>;
  inboxFiltersSheetRef: React.RefObject<BottomSheetModal>;
  slaEventsSheetRef: React.RefObject<BottomSheetModal>;
  deliveryStatusSheetRef: React.RefObject<BottomSheetModal>;
  updateParticipantSheetRef: React.RefObject<BottomSheetModal>;
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
  const userAvailabilityStatusSheetRef = useRef<BottomSheetModal>(null);
  const filtersModalSheetRef = useRef<BottomSheetModal>(null);
  const actionsModalSheetRef = useRef<BottomSheetModal>(null);
  const languagesModalSheetRef = useRef<BottomSheetModal>(null);
  const notificationPreferencesSheetRef = useRef<BottomSheetModal>(null);
  const addLabelSheetRef = useRef<BottomSheetModal>(null);
  const macrosListSheetRef = useRef<BottomSheetModal>(null);
  const chatPagerView = useRef<PagerView>(null);
  const switchAccountSheetRef = useRef<BottomSheetModal>(null);
  const debugActionsSheetRef = useRef<BottomSheetModal>(null);
  const inboxFiltersSheetRef = useRef<BottomSheetModal>(null);
  const messageListRef = useRef<FlashList<Message | { date: string }>>(null);
  const slaEventsSheetRef = useRef<BottomSheetModal>(null);
  const deliveryStatusSheetRef = useRef<BottomSheetModal>(null);
  const updateParticipantSheetRef = useRef<BottomSheetModal>(null);

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
  };

  return <RefsContext.Provider value={contextRefValues}>{children}</RefsContext.Provider>;
};

export { RefsProvider, useRefsContext };
