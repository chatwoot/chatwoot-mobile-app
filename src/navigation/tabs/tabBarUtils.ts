/**
 * [conomni] Мобильный паритет, поток C (C4) — чистая логика таб-бара, вынесенная из
 * BottomTabBar.tsx: тот файл импортирует `@/hooks` (react-redux — берёт `badgeCounters` из
 * стора `chat-list`, C1) и не грузится в jest этого проекта (ESM-сборка react-redux не
 * транслируется текущим jest-конфигом — та же причина, по которой `ChatListHeader.tsx` и
 * `StageTabs.tsx` хранят чистые функции у себя, а не в экранах, которые их используют, см.
 * комментарий у `selectStageAction` в StageTabs.tsx). Функции ниже протестированы напрямую
 * в `./specs/tabBarUtils.spec.ts`.
 */

/** Роуты, которые рисуются в баре, и их порядок (C4, п.4 плана волны). Таб `Inbox`
 * (уведомления) остаётся зарегистрированным роутом Tab.Navigator, но сюда не входит — он
 * открывается только программно, колокольчиком в шапке списка (`ChatListHeader.tsx`). */
export const TAB_BAR_ROUTE_NAMES = [
  'ChatListNew',
  'ChatListMine',
  'ChatListArchive',
  'Funnel',
  'Settings',
] as const;

export type TabBarRouteName = (typeof TAB_BAR_ROUTE_NAMES)[number];

function isTabBarRouteName(name: string): name is TabBarRouteName {
  return (TAB_BAR_ROUTE_NAMES as readonly string[]).includes(name);
}

/**
 * Роуты бара в заданном порядке, без служебных (`Inbox`) и без тех, что не
 * зарегистрированы навигатором сейчас (например, `hasConversationPermission === false`
 * прячет и списки, и воронку — остаётся одна «Настройки»). Порядок диктует этот список, а
 * не порядок `state.routes` (тот равен порядку регистрации Tab.Screen).
 */
export function visibleTabBarRoutes<T extends { name: string }>(routes: T[]): T[] {
  const byName = new Map(routes.map(route => [route.name, route]));
  return TAB_BAR_ROUTE_NAMES.map(name => byName.get(name)).filter((route): route is T => !!route);
}

const LABEL_KEYS: Record<TabBarRouteName, string> = {
  ChatListNew: 'FOOTER.NEW',
  ChatListMine: 'FOOTER.MINE',
  ChatListArchive: 'FOOTER.ARCHIVE',
  Funnel: 'FOOTER.FUNNEL',
  Settings: 'FOOTER.SETTINGS',
};

/** Ключ локали подписи под иконкой. Незнакомый роут — пустая строка, не исключение. */
export function getTabLabelKey(routeName: string): string {
  return isTabBarRouteName(routeName) ? LABEL_KEYS[routeName] : '';
}

export interface TabBarBadgeCounters {
  new: number;
  mine: number;
}

/** Сырое число бейджа для роута — бейдж есть только у «Новых»/«Моих» (C1: `badgeCounters`),
 * у остальных роутов — `null` (компонент по `null` бейдж не рисует). */
export function getTabBadgeCount(routeName: string, counters: TabBarBadgeCounters): number | null {
  if (routeName === 'ChatListNew') return counters.new;
  if (routeName === 'ChatListMine') return counters.mine;
  return null;
}

/** Бейдж не показывается при нуле (и при отсутствующем счётчике — `null`). */
export function shouldShowBadge(count: number | null): boolean {
  return typeof count === 'number' && count > 0;
}

/** Текст бейджа — трёхзначные и больше сворачиваются в «99+». */
export function formatBadgeCount(count: number): string {
  return count > 99 ? '99+' : String(count);
}
