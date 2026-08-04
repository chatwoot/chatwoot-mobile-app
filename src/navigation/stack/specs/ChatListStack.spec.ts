import { resolveInitialChatListTab, DEFAULT_CHAT_LIST_TAB } from '../chatListStackUtils';

describe('resolveInitialChatListTab', () => {
  it('отдаёт вкладку, переданную в initialParams таба', () => {
    expect(resolveInitialChatListTab('mine')).toBe('mine');
    expect(resolveInitialChatListTab('archive')).toBe('archive');
    expect(resolveInitialChatListTab('new')).toBe('new');
  });

  it('без параметра — дефолт «Новые» (как resolveRouteTab в ChatListHeader)', () => {
    expect(resolveInitialChatListTab(undefined)).toBe(DEFAULT_CHAT_LIST_TAB);
    expect(DEFAULT_CHAT_LIST_TAB).toBe('new');
  });
});
