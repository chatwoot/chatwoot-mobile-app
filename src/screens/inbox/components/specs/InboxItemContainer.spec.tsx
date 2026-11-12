import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { InboxItemContainerComponent } from '../InboxItemContainer';
import { Swipeable } from '@/components-next';
import { useAppDispatch } from '@/hooks';
import { useSplitView } from '@/navigation/split/SplitViewContext';
import { conversationActions } from '@/store/conversation/conversationActions';
import type { Notification } from '@/types/Notification';

jest.mock('react-native-reanimated', () => {
  const { View, Text } = jest.requireActual('react-native');
  return { __esModule: true, default: { View, Text } };
});

jest.mock('@/theme/appearance', () => ({ useAppAppearance: () => 'dark' }));
jest.mock('@/hooks', () => ({ useAppDispatch: jest.fn(), useAppSelector: () => null }));
jest.mock('@/navigation/split/SplitViewContext', () => ({ useSplitView: jest.fn() }));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ dispatch: jest.fn() }),
  StackActions: { push: jest.fn() },
}));
jest.mock('@/components-next', () => ({ Swipeable: 'Swipeable', Icon: 'Icon' }));
jest.mock('../InboxItem', () => ({ InboxItem: 'InboxItem' }));
jest.mock('@/navigation/split/SelectedRowBackground', () => ({
  SelectedRowBackground: 'SelectedRowBackground',
}));
jest.mock('@/svg-icons', () => ({
  MarkAsRead: 'Read',
  MarkAsUnRead: 'Unread',
  DeleteIcon: 'Delete',
}));
jest.mock('@/utils/toastUtils', () => ({ showToast: jest.fn() }));
jest.mock('@/store/conversation/conversationActions', () => ({
  conversationActions: { fetchConversation: jest.fn() },
}));
jest.mock('@/store/notification/notificationAction', () => ({
  notificationActions: { markAsRead: jest.fn(() => ({ type: 'read' })) },
}));
jest.mock('@/store/inbox/inboxSelectors', () => ({ selectInboxById: jest.fn() }));
jest.mock('@/i18n', () => ({ t: (key: string) => key }));

const notification = (id: number) =>
  ({
    primaryActor: { id },
    notificationType: 'conversation_assignment',
    lastActivityAt: 1,
  }) as Notification;

describe('unfolded Duo notification selection', () => {
  beforeEach(() => jest.clearAllMocks());
  it('opens consecutive selections immediately without waiting for network requests', async () => {
    const dispatch = jest.fn(() => new Promise(() => {}));
    const openConversation = jest.fn();
    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    (useSplitView as jest.Mock).mockReturnValue({ selectedConversationId: null, openConversation });
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <InboxItemContainerComponent
          item={notification(11)}
          index={0}
          openedRowIndex={{ value: null } as never}
        />,
      );
    });
    await act(async () => {
      await renderer.root.findByType(Swipeable).props.handlePress();
    });
    act(() => {
      renderer.update(
        <InboxItemContainerComponent
          item={notification(12)}
          index={0}
          openedRowIndex={{ value: null } as never}
        />,
      );
    });
    await act(async () => {
      await renderer.root.findByType(Swipeable).props.handlePress();
    });
    expect(openConversation.mock.calls).toEqual([[11], [12]]);
    expect(conversationActions.fetchConversation).not.toHaveBeenCalled();
  });
  it('reopens the selected conversation so an open secondary pane is closed', async () => {
    const openConversation = jest.fn();
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn());
    (useSplitView as jest.Mock).mockReturnValue({ selectedConversationId: 11, openConversation });
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <InboxItemContainerComponent
          item={notification(11)}
          index={0}
          openedRowIndex={{ value: null } as never}
        />,
      );
    });
    await act(async () => {
      await renderer.root.findByType(Swipeable).props.handlePress();
    });
    expect(openConversation).toHaveBeenCalledWith(11);
  });
});
