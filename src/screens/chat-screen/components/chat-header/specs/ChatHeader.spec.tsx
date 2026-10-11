import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';

import { Inbox } from '@/types/Inbox';
import { ChatHeader } from '../ChatHeader';

jest.mock('react-native-reanimated', () => {
  const { View, Text } = jest.requireActual('react-native');
  return { __esModule: true, default: { View, Text } };
});
jest.mock('@/context', () => ({
  useRefsContext: () => ({ slaEventsSheetRef: { current: null } }),
}));
jest.mock('@/components-next/common/sheet/Sheet', () => ({ Sheet: () => null }));
jest.mock('@/components-next', () => ({ Avatar: () => null, Icon: () => null }));
jest.mock('@/svg-icons', () => ({
  PhoneIcon: () => null,
  ChevronLeft: () => null,
  Overflow: () => null,
  ResolvedIcon: () => null,
  SLAIcon: () => null,
}));
jest.mock('../DropdownMenu', () => ({ ChatDropdownMenu: () => null }));
jest.mock('../SlaEvents', () => ({ SlaEvents: () => null }));

const inbox = {
  id: 7,
  name: 'Support Email',
  channelType: 'Channel::Email',
  medium: '',
} as Inbox;

const props = {
  name: 'John Doe',
  imageSrc: { uri: 'https://example.com/avatar.png' },
  isResolved: false,
  dashboardsList: [],
  onBackPress: () => {},
  onContactDetailsPress: () => {},
  onToggleChatStatus: () => {},
};

const render = (overrides = {}) => {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(<ChatHeader {...props} {...overrides} />);
  });
  return renderer;
};

const textAt = (renderer: ReactTestRenderer, testID: string) =>
  renderer.root.findAllByProps({ testID }).map(node => node.props.children)[0];

describe('ChatHeader', () => {
  it('names the inbox the conversation belongs to', () => {
    expect(textAt(render({ inbox }), 'chat.header.inbox-name')).toBe('Support Email');
  });

  it('omits the inbox line when the inbox is not loaded yet', () => {
    expect(render().root.findAllByProps({ testID: 'chat.header.inbox-name' })).toHaveLength(0);
  });
});
