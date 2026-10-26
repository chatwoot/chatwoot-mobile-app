import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';

import { useWindowDimensions, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatScreen from '@/screens/chat-screen/ChatScreen';
import { ContainerWidthContext, RefsProvider } from '@/context';
import { tailwind } from '@/theme';
import { useIsSplitLayout } from '@/utils';
import i18n from '@/i18n';
import type { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import { DetailPaneContext, SplitViewContext } from './SplitViewContext';
import { SplitEmptyState } from './SplitEmptyState';
import { ConversationPaneEmptyIcon } from '@/svg-icons';

// List + conversation side by side on wide side-tab layouts (open iPhone Duo), like
// Mail or WhatsApp. On other layouts the list renders alone and rows push the chat
// screen as before.

const PaneStack = createNativeStackNavigator<Pick<TabBarExcludedScreenParamList, 'ChatScreen'>>();

// The chat runs in its own small stack so ChatScreen keeps reading its route params.
// Screens it opens (contact details, dashboard apps) are not in this stack, so those
// navigations go up to the app stack as before. Its own RefsProvider keeps the chat's
// sheets and pager separate from the list's.
const ConversationPane = ({ conversationId }: { conversationId: number }) => (
  <DetailPaneContext.Provider value={true}>
    <RefsProvider>
      <PaneStack.Navigator screenOptions={{ headerShown: false }}>
        <PaneStack.Screen
          name="ChatScreen"
          component={ChatScreen}
          initialParams={{ conversationId }}
        />
      </PaneStack.Navigator>
    </RefsProvider>
  </DetailPaneContext.Provider>
);

const EmptyPane = ({ icon, message }: { icon?: React.ReactElement; message?: string }) => (
  <View style={tailwind.style('flex-1 items-center justify-center')}>
    <SplitEmptyState
      icon={icon ?? <ConversationPaneEmptyIcon />}
      message={message ?? i18n.t('CONVERSATION.SPLIT_VIEW.EMPTY')}
    />
  </View>
);

type SplitViewProps = PropsWithChildren<{
  // When this changes (e.g. the list's filters), the open conversation is closed: the
  // list is refetched and may no longer contain it.
  resetKey?: unknown;
  // What the conversation pane shows before anything is selected.
  emptyIcon?: React.ReactElement;
  emptyMessage?: string;
}>;

export const SplitView = ({ children, resetKey, emptyIcon, emptyMessage }: SplitViewProps) => {
  const isSplit = useIsSplitLayout();
  const { width } = useWindowDimensions();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [detailWidth, setDetailWidth] = useState<number | null>(null);

  const value = useMemo(
    () => ({
      selectedConversationId,
      openConversation: setSelectedConversationId,
      closeConversation: () => setSelectedConversationId(null),
    }),
    [selectedConversationId],
  );

  const resetSignature = JSON.stringify(resetKey ?? null);
  const lastResetSignature = useRef(resetSignature);
  useEffect(() => {
    if (lastResetSignature.current !== resetSignature) {
      lastResetSignature.current = resetSignature;
      setSelectedConversationId(null);
    }
  }, [resetSignature]);

  if (!isSplit) return <>{children}</>;

  // The list takes 40% of the display and the conversation the rest.
  const listWidth = Math.max(320, Math.round(width * 0.4));

  return (
    <SplitViewContext.Provider value={value}>
      <View style={tailwind.style('flex-1 flex-row bg-white')}>
        {/* Each pane tells width-based layouts (rows, bubbles, action grids) its own width. */}
        <ContainerWidthContext.Provider value={listWidth}>
          <View style={{ width: listWidth }}>{children}</View>
        </ContainerWidthContext.Provider>
        <View style={tailwind.style('w-[1px] bg-blackA-A3')} />
        <ContainerWidthContext.Provider value={detailWidth}>
          <View
            style={[
              // Gray only for the empty state; an open conversation sits on white.
              tailwind.style('flex-1', selectedConversationId ? 'bg-white' : 'bg-gray-50'),
            ]}
            onLayout={e => setDetailWidth(Math.round(e.nativeEvent.layout.width))}>
            {/* Wait for the pane's width so the chat doesn't first lay out at window width. */}
            {selectedConversationId && detailWidth ? (
              <ConversationPane
                key={selectedConversationId}
                conversationId={selectedConversationId}
              />
            ) : selectedConversationId ? null : (
              <EmptyPane icon={emptyIcon} message={emptyMessage} />
            )}
          </View>
        </ContainerWidthContext.Provider>
      </View>
    </SplitViewContext.Provider>
  );
};
