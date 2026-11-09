import React from 'react';

import ChatScreen from '@/screens/chat-screen/ChatScreen';
import { useSplitView } from './SplitViewContext';

type PaneChatProps = React.ComponentProps<typeof ChatScreen>;

// Reads the conversation from the split view's selection rather than its route params.
// A nested navigator's state is kept by its parent screen, so a remounted pane would
// restore the first conversation it showed and ignore new params. ChatScreen already
// handles its conversation changing (it refetches and resets its content).
export const PaneChat = (props: PaneChatProps) => {
  const selectedConversationId = useSplitView()?.selectedConversationId;
  const route = {
    ...props.route,
    params: { ...props.route.params, conversationId: selectedConversationId ?? 0 },
  };
  return <ChatScreen {...props} route={route} />;
};
