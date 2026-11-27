import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StackActions } from '@react-navigation/native';
import { PreviousConversationItem } from '../PreviousConversationItem';
import { useSplitView } from '@/navigation/split/SplitViewContext';
import type { Conversation } from '@/types';

const mockDispatch = jest.fn();
let mockTapHandler: () => void = () => {};

jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: { View }, runOnJS: (fn: () => void) => fn };
});
jest.mock('react-native-gesture-handler', () => ({
  Gesture: {
    Tap: () => ({
      onEnd: (handler: () => void) => {
        mockTapHandler = handler;
        return {};
      },
    }),
  },
  GestureDetector: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ dispatch: mockDispatch }),
  StackActions: { push: jest.fn((name, params) => ({ type: 'PUSH', name, params })) },
}));
jest.mock('@/theme/useTailwind', () => ({ useTailwind: () => ({ style: () => ({}) }) }));
jest.mock('@/hooks', () => ({ useAppSelector: () => null }));
jest.mock('@/navigation/split/SplitViewContext', () => ({ useSplitView: jest.fn() }));
jest.mock('@/store/inbox/inboxSelectors', () => ({ selectInboxById: jest.fn() }));
jest.mock('@/store/label/labelSelectors', () => ({ selectAllLabels: jest.fn() }));
jest.mock('@/utils', () => ({ getLastMessage: () => null }));
jest.mock('@/screens/conversations/components/conversation-item/ConversationItemDetail', () => ({
  ConversationItemDetailContent: 'ConversationItemDetailContent',
}));

const conversation = { id: 229, inboxId: 1, messages: [] } as unknown as Conversation;

const renderAndTap = () => {
  act(() => {
    TestRenderer.create(<PreviousConversationItem conversation={conversation} contactId={218} />);
  });
  act(() => mockTapHandler());
};

describe('PreviousConversationItem', () => {
  beforeEach(() => jest.clearAllMocks());

  it('pushes the conversation onto the stack so back returns to the contact', () => {
    (useSplitView as jest.Mock).mockReturnValue(null);
    renderAndTap();
    expect(StackActions.push).toHaveBeenCalledWith('ChatScreen', {
      conversationId: 229,
      isConversationOpenedExternally: false,
    });
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'PUSH' }));
  });

  it('opens the conversation beside the contact in the split layout', () => {
    const openConversationFromContact = jest.fn();
    (useSplitView as jest.Mock).mockReturnValue({ openConversationFromContact });
    renderAndTap();
    expect(openConversationFromContact).toHaveBeenCalledWith(229, 218);
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
