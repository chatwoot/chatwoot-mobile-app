import React from 'react';
import { ActivityIndicator } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { ContactPreviousConversations } from '../ContactPreviousConversations';
import { PreviousConversationItem } from '../PreviousConversationItem';
import type { Conversation } from '@/types';

let mockRecords: Record<number, Conversation[]> = {};

jest.mock('react-native-reanimated', () => {
  const { View, Text } = jest.requireActual('react-native');
  return { __esModule: true, default: { View, Text } };
});
jest.mock('@/theme/useTailwind', () => ({ useTailwind: () => ({ style: () => ({}) }) }));
jest.mock('@/hooks', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ contactConversations: { records: mockRecords } }),
}));
jest.mock('@/navigation/split/SplitViewContext', () => ({ useIsInDetailPane: () => false }));
jest.mock('@/utils', () => ({
  IOS_DESIGN: false,
  getLastMessage: ({ messages }: { messages: unknown[] }) => messages[0] ?? null,
}));
jest.mock('@/i18n', () => ({ t: (key: string) => key }));
jest.mock('../PreviousConversationItem', () => ({
  PreviousConversationItem: 'PreviousConversationItem',
}));

const conversation = (id: number, hasMessage = true) =>
  ({ id, messages: hasMessage ? [{ id: id * 10 }] : [] }) as unknown as Conversation;

const render = () => {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(
      <ContactPreviousConversations contactId={218} currentConversationId={230} />,
    );
  });
  return renderer.root;
};

describe('ContactPreviousConversations', () => {
  it('shows a loader until the contact conversations are fetched', () => {
    mockRecords = {};
    const root = render();
    expect(root.findAllByType(ActivityIndicator)).toHaveLength(1);
  });

  it('lists other conversations with messages, excluding the open one', () => {
    mockRecords = { 218: [conversation(230), conversation(229), conversation(228, false)] };
    const items = render().findAllByType(PreviousConversationItem);
    expect(items.map(item => item.props.conversation.id)).toEqual([229]);
    expect(items[0].props.contactId).toBe(218);
  });

  it('shows the empty state when only the open conversation exists', () => {
    mockRecords = { 218: [conversation(230)] };
    const root = render();
    expect(root.findAllByType(PreviousConversationItem)).toHaveLength(0);
    expect(root.findByProps({ children: 'CONTACT_CONVERSATIONS.EMPTY' })).toBeTruthy();
  });
});
