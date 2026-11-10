import React from 'react';

import ChatScreen from '@/screens/chat-screen/ChatScreen';
import { useSplitView } from './SplitViewContext';

type PaneChatProps = React.ComponentProps<typeof ChatScreen>;

// Nested navigators ignore new route params.
export const PaneChat = (props: PaneChatProps) => {
  const selectedConversationId = useSplitView()?.selectedConversationId;
  const route = {
    ...props.route,
    params: { ...props.route.params, conversationId: selectedConversationId ?? 0 },
  };
  return <ChatScreen {...props} route={route} />;
};
