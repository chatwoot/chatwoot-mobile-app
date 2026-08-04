/**
 * [conomni] Экран списка чатов (C5, поток C мобильного паритета) — один экран под три
 * таба приложения ("Новые"/"Мои"/"Архив"), различаемых `route.params.tab`
 * (см. `resolveRouteTab` в `./components/ChatListHeader.tsx`, регистрация тремя табами с
 * разными `initialParams` — дело C4, не этого файла). Питается стором `chat-list` (C1),
 * строку и шапку/шторку фильтра не переписывает — использует готовые компоненты C5,
 * написанные раньше (`./components/*`).
 *
 * Этот файл НЕ тестируется напрямую: он импортирует `@/hooks` (react-redux), а тот падает
 * при загрузке в jest этого проекта на ESM-сборке ("Cannot use import statement outside a
 * module") — чистая логика, которую можно протестировать, уже вынесена в
 * `./components/ChatListHeader.tsx` и `./components/ChatListRow.tsx` и покрыта
 * `./specs/ChatListScreen.spec.ts` (менять его нельзя).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList, ListRenderItemInfo, ViewToken } from '@shopify/flash-list';
import { BottomSheetModal, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import { StackActions, useIsFocused, useNavigation, useRoute } from '@react-navigation/native';

import { BottomSheetBackdrop, BottomSheetWrapper } from '@/components-next';
import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectUserId } from '@/store/auth/authSelectors';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import { chatListActions } from '@/store/chat-list/chatListActions';
import {
  selectChatListCards,
  selectChatListIsLoading,
  selectChatListIsLoadingMore,
  selectChatListPage,
  selectChatListTotal,
} from '@/store/chat-list/chatListSelectors';
import type { Card, ChatListQueryFilters } from '@/store/chat-list/chatListTypes';
import { useUrgencyTick } from '@/utils/urgency';

import ChatListHeader, {
  getEmptyStateKey,
  resolveRouteTab,
  shouldLoadMore,
} from './components/ChatListHeader';
import ChatListRow, { handleRowPress } from './components/ChatListRow';
import ChatListFilterSheet from './components/ChatListFilterSheet';

// Ни один загруженный список не бывает пустым между рендерами не по делу — стабильная
// ссылка нужна, чтобы `useUrgencyTick` не переставляла таймер на каждый рендер, когда экран
// не в фокусе (см. использование ниже).
const EMPTY_CARDS: Card[] = [];

/**
 * Узкий тип навигации — как и в `FunnelCardRow.tsx`/`LoginScreen.tsx` этого проекта:
 * фактический тип `useNavigation()` (`NavigationProp<RootParamList>`) не присваивается
 * широким типам react-navigation напрямую, поэтому берём только то, что реально нужно.
 */
interface ChatListNavigationLike {
  dispatch: (action: ReturnType<typeof StackActions.push>) => void;
}

const ChatListScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const route = useRoute();

  const tab = resolveRouteTab((route.params as { tab?: unknown } | undefined)?.tab);

  const userId = useAppSelector(selectUserId);
  const inboxes = useAppSelector(selectAllInboxes);
  const cards = useAppSelector(selectChatListCards(tab));
  const total = useAppSelector(selectChatListTotal(tab));
  const page = useAppSelector(selectChatListPage(tab));
  const isLoading = useAppSelector(selectChatListIsLoading);
  const isLoadingMore = useAppSelector(selectChatListIsLoadingMore);

  const [filters, setFilters] = useState<ChatListQueryFilters>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filterSheetRef = useRef<BottomSheetModal>(null);
  const visibleIdsRef = useRef<number[]>([]);

  const filterSheetAnimationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const fetchPage = useCallback(
    (targetPage: number, currentFilters: ChatListQueryFilters) => {
      if (!userId) return undefined;
      return dispatch(
        chatListActions.fetchChatList({ tab, page: targetPage, userId, filters: currentFilters }),
      );
    },
    [dispatch, tab, userId],
  );

  // Первая загрузка вкладки и перезагрузка при смене вкладки/фильтров.
  useEffect(() => {
    fetchPage(1, filters);
  }, [fetchPage, filters]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchPage(1, filters)?.finally(() => setIsRefreshing(false));
  }, [fetchPage, filters]);

  const handleEndReached = useCallback(() => {
    if (shouldLoadMore(cards.length, total, isLoadingMore)) {
      fetchPage(page + 1, filters);
    }
  }, [cards.length, total, isLoadingMore, fetchPage, page, filters]);

  const handleNotificationsPress = useCallback(() => {
    navigation.navigate('Inbox' as never);
  }, [navigation]);

  const handleFilterPress = useCallback(() => {
    filterSheetRef.current?.present();
  }, []);

  const handleFilterApply = useCallback((nextFilters: ChatListQueryFilters) => {
    filterSheetRef.current?.dismiss();
    setFilters(nextFilters);
  }, []);

  const handleFilterReset = useCallback(() => {
    filterSheetRef.current?.dismiss();
    setFilters({});
  }, []);

  const handlePressCard = useCallback(
    (card: Card) => {
      const navigationLike: ChatListNavigationLike = navigation;
      handleRowPress((screen, params) => {
        navigationLike.dispatch(StackActions.push(screen, params));
      }, card);
    },
    [navigation],
  );

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      visibleIdsRef.current = viewableItems
        .map(viewToken => (viewToken.item as Card | undefined)?.id)
        .filter((id): id is number => typeof id === 'number');
    },
    [],
  );

  const handleUrgencyTick = useCallback(() => {
    const ids = visibleIdsRef.current;
    if (ids.length > 0) {
      dispatch(chatListActions.fetchRows({ tab, ids }));
    }
  }, [dispatch, tab]);

  // Таймер светофора взводится только пока экран в фокусе — на других вкладках получает
  // пустой список, `useUrgencyTick` снимает предыдущий таймер эффектом очистки и новый уже
  // не ставит (см. src/utils/urgency.ts).
  const urgencyCards = useMemo(() => (isFocused ? cards : EMPTY_CARDS), [isFocused, cards]);
  useUrgencyTick(urgencyCards, handleUrgencyTick);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Card>) => (
      <ChatListRow card={item} tab={tab} onPress={handlePressCard} />
    ),
    [tab, handlePressCard],
  );

  const showEmptyLoader = isLoading && !isRefreshing && cards.length === 0;
  const showEmptyState = !showEmptyLoader && !isLoading && cards.length === 0;

  return (
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
      <ChatListHeader
        tab={tab}
        onNotificationsPress={handleNotificationsPress}
        onFilterPress={handleFilterPress}
      />

      {showEmptyLoader ? (
        <View style={tailwind.style('flex-1 items-center justify-center')}>
          <ActivityIndicator />
        </View>
      ) : showEmptyState ? (
        <ScrollView
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          contentContainerStyle={tailwind.style('flex-1 items-center justify-center px-8')}>
          <Text style={tailwind.style('text-sm text-gray-600 text-center')}>
            {i18n.t(getEmptyStateKey(tab))}
          </Text>
        </ScrollView>
      ) : (
        <FlashList<Card>
          data={cards}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          estimatedItemSize={88}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          onViewableItemsChanged={handleViewableItemsChanged}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={tailwind.style('py-4 items-center')}>
                <ActivityIndicator size="small" />
              </View>
            ) : null
          }
        />
      )}

      <BottomSheetModal
        ref={filterSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        animationConfigs={filterSheetAnimationConfigs}
        enablePanDownToClose
        snapPoints={['65%']}>
        <BottomSheetWrapper>
          <ChatListFilterSheet
            inboxes={inboxes}
            initialInboxIds={filters.inboxIds ?? []}
            onApply={handleFilterApply}
            onReset={handleFilterReset}
          />
        </BottomSheetWrapper>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

export default ChatListScreen;
