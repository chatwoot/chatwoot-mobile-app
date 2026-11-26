import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { FlatList } from 'react-native';
import BulkPickerScreen from '../BulkPickerScreen';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { conversationActions } from '@/store/conversation/conversationActions';
import { selectConversationsState } from '@/store/conversation/conversationSelectors';
import {
  selectSelectedIds,
  selectSelectedInboxes,
  selectSelectedConversations,
} from '@/store/conversation/conversationSelectedSlice';

jest.mock('@/store/conversation/conversationActions', () => ({
  conversationActions: {
    bulkAction: jest.fn((payload: unknown) => ({ type: 'bulkAction', payload })),
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('react-redux', () => ({
  shallowEqual: (a: unknown, b: unknown) => a === b,
}));

jest.mock('@/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('@/theme/useTailwind', () => ({
  useTailwind: () => ({
    style: (...args: unknown[]) => args,
    color: () => '#000',
  }),
}));

jest.mock('@/utils', () => ({
  useHaptic: () => jest.fn(),
}));

jest.mock('@/utils/toastUtils', () => ({
  showToast: jest.fn(),
}));

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/navigation/split/PaneHeader', () => ({
  PaneHeader: () => null,
}));

jest.mock('@/screens/search/components/header/IOSSearchField', () => ({
  IOSSearchField: () => null,
}));

jest.mock('@/components-next', () => ({
  Avatar: () => null,
  Icon: () => null,
}));

jest.mock('@/components-next/side-toolbar/GlassCircleButton', () => ({
  GlassCircleButton: () => null,
}));

jest.mock('@/components-next/side-toolbar/GlassPillButton', () => ({
  GlassPillButton: () => null,
}));

jest.mock('@/svg-icons', () => ({
  CloseIcon: () => null,
  TickIcon: () => null,
}));

describe('BulkPickerScreen', () => {
  const dispatch = jest.fn();
  const navigation = { goBack: jest.fn(), navigate: jest.fn() };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (useAppDispatch as unknown as jest.Mock).mockReturnValue(dispatch);
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('initializes common labels as checked and toggles remove/add when pressed', () => {
    const labels = [
      { id: 1, title: 'sales', color: '#ff0000' },
      { id: 2, title: 'support', color: '#00ff00' },
    ];
    const selectedConversations = [
      { id: 10, labels: ['sales'] },
      { id: 20, labels: ['sales'] },
    ];
    const entities = {
      10: { id: 10, labels: ['sales'] },
      20: { id: 20, labels: ['sales'] },
    };

    (useAppSelector as unknown as jest.Mock).mockImplementation((selector: unknown) => {
      if (selector === selectSelectedIds) return [10, 20];
      if (selector === selectSelectedInboxes) return [1];
      if (selector === selectSelectedConversations) return selectedConversations;
      if (selector === selectConversationsState) return { entities };
      return labels;
    });

    const route = { params: { kind: 'label' as const } };
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <BulkPickerScreen route={route as never} navigation={navigation as never} />,
      );
    });

    const flatList = renderer!.root.findByType(FlatList);
    const data = flatList.props.data;
    expect(data.length).toBe(2);

    // First label is 'sales', which is common to both conversations -> should be checked
    expect(data[0].title).toBe('sales');
    expect(data[0].checked).toBe(true);

    // Second label is 'support' -> should be unchecked
    expect(data[1].title).toBe('support');
    expect(data[1].checked).toBe(false);

    // Pressing 'sales' (already checked) should dispatch remove action and update checked state
    act(() => {
      data[0].onPress();
    });

    expect(dispatch).toHaveBeenCalledWith(
      conversationActions.bulkAction({
        type: 'Conversation',
        ids: [10, 20],
        labels: { remove: ['sales'] },
      }),
    );

    // Re-check updated data from flatList
    const updatedDataAfterRemove = flatList.props.data;
    expect(updatedDataAfterRemove[0].checked).toBe(false);

    // Pressing 'support' (unchecked) should dispatch add action and update checked state
    act(() => {
      updatedDataAfterRemove[1].onPress();
    });

    expect(dispatch).toHaveBeenCalledWith(
      conversationActions.bulkAction({
        type: 'Conversation',
        ids: [10, 20],
        labels: { add: ['support'] },
      }),
    );

    const updatedDataAfterAdd = flatList.props.data;
    expect(updatedDataAfterAdd[1].checked).toBe(true);
  });

  it('assigns agent and navigates back when kind is assign', async () => {
    const agents = [{ id: 42, name: 'Agent Smith', thumbnail: null }];
    (useAppSelector as unknown as jest.Mock).mockImplementation((selector: unknown) => {
      if (selector === selectSelectedIds) return [10];
      if (selector === selectSelectedInboxes) return [1];
      if (selector === selectSelectedConversations) return [{ id: 10, inboxId: 1 }];
      if (selector === selectConversationsState) return { entities: { 10: { id: 10 } } };
      return agents;
    });

    const route = { params: { kind: 'assign' as const } };
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <BulkPickerScreen route={route as never} navigation={navigation as never} />,
      );
    });

    const flatList = renderer!.root.findByType(FlatList);
    const data = flatList.props.data;
    expect(data.length).toBe(1);
    expect(data[0].title).toBe('Agent Smith');

    await act(async () => {
      await data[0].onPress();
    });

    expect(dispatch).toHaveBeenCalledWith(
      conversationActions.bulkAction({
        type: 'Conversation',
        ids: [10],
        fields: { assignee_id: 42 },
      }),
    );
    expect(navigation.goBack).toHaveBeenCalled();
  });
});
