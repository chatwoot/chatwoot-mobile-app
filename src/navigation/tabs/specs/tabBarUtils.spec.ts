import {
  TAB_BAR_ROUTE_NAMES,
  visibleTabBarRoutes,
  getTabLabelKey,
  getTabBadgeCount,
  shouldShowBadge,
  formatBadgeCount,
} from '../tabBarUtils';

describe('visibleTabBarRoutes', () => {
  it('при пяти зарегистрированных роутах бара рисует все пять в заданном порядке', () => {
    const routes = TAB_BAR_ROUTE_NAMES.map(name => ({ name, key: `${name}-key` }));

    const result = visibleTabBarRoutes(routes);

    expect(result.map(r => r.name)).toEqual([...TAB_BAR_ROUTE_NAMES]);
  });

  it('роут Inbox в баре отсутствует, даже если он зарегистрирован в навигаторе', () => {
    const routes = [
      { name: 'Inbox', key: 'inbox-key' },
      ...TAB_BAR_ROUTE_NAMES.map(name => ({ name, key: `${name}-key` })),
    ];

    const result = visibleTabBarRoutes(routes);

    expect(result.some(r => r.name === 'Inbox')).toBe(false);
    expect(result).toHaveLength(TAB_BAR_ROUTE_NAMES.length);
  });

  it('сохраняет порядок бара независимо от порядка регистрации роутов', () => {
    const shuffled = [...TAB_BAR_ROUTE_NAMES].reverse().map(name => ({ name, key: name }));

    const result = visibleTabBarRoutes(shuffled);

    expect(result.map(r => r.name)).toEqual([...TAB_BAR_ROUTE_NAMES]);
  });

  it('незарегистрированный роут бара (условие hasConversationPermission) молча пропускается', () => {
    const routes = [{ name: 'Settings', key: 'settings-key' }];

    const result = visibleTabBarRoutes(routes);

    expect(result.map(r => r.name)).toEqual(['Settings']);
  });
});

describe('getTabLabelKey', () => {
  it('отдаёт ключ локали FOOTER.* для каждого роута бара', () => {
    expect(getTabLabelKey('ChatListNew')).toBe('FOOTER.NEW');
    expect(getTabLabelKey('ChatListMine')).toBe('FOOTER.MINE');
    expect(getTabLabelKey('ChatListArchive')).toBe('FOOTER.ARCHIVE');
    expect(getTabLabelKey('Funnel')).toBe('FOOTER.FUNNEL');
    expect(getTabLabelKey('Settings')).toBe('FOOTER.SETTINGS');
  });

  it('незнакомый роут — пустая строка, а не исключение', () => {
    expect(getTabLabelKey('Inbox')).toBe('');
    expect(getTabLabelKey('WhateverJunk')).toBe('');
  });
});

describe('getTabBadgeCount', () => {
  const counters = { new: 5, mine: 12 };

  it('«Новые» и «Мои» берут счётчик из badgeCounters', () => {
    expect(getTabBadgeCount('ChatListNew', counters)).toBe(5);
    expect(getTabBadgeCount('ChatListMine', counters)).toBe(12);
  });

  it('у остальных роутов бейджа нет', () => {
    expect(getTabBadgeCount('ChatListArchive', counters)).toBeNull();
    expect(getTabBadgeCount('Funnel', counters)).toBeNull();
    expect(getTabBadgeCount('Settings', counters)).toBeNull();
  });
});

describe('shouldShowBadge', () => {
  it('бейдж с нулём не рендерится', () => {
    expect(shouldShowBadge(0)).toBe(false);
  });

  it('null (роут без бейджа) не рендерится', () => {
    expect(shouldShowBadge(null)).toBe(false);
  });

  it('положительное значение рендерится', () => {
    expect(shouldShowBadge(1)).toBe(true);
    expect(shouldShowBadge(120)).toBe(true);
  });
});

describe('formatBadgeCount', () => {
  it('трёхзначное значение сворачивается в «99+»', () => {
    expect(formatBadgeCount(120)).toBe('99+');
    expect(formatBadgeCount(100)).toBe('99+');
  });

  it('двузначное и меньше — как есть', () => {
    expect(formatBadgeCount(99)).toBe('99');
    expect(formatBadgeCount(5)).toBe('5');
  });
});
