import { Icon } from '@/components-next';
import { Spinner } from '@/components-next/spinner';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { KanbanStackParamList } from '@/navigation/stack/KanbanStack';
import { kanbanActions } from '@/store/kanban/kanbanActions';
import { selectCurrentKanbanFunnel } from '@/store/kanban/kanbanSelectors';
import { KanbanItem as KanbanItemType } from '@/store/kanban/kanbanTypes';
import { Overflow, Plus } from '@/svg-icons/common';
import { tailwind } from '@/theme/tailwind';
import { logger } from '@/utils/logger';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { CreateStageModal } from './components/CreateStageModal';
import { EditFunnelModal } from './components/EditFunnelModal';
import { KanbanErrorBoundary } from './components/KanbanErrorBoundary';
import { KanbanStage } from './components/KanbanStage';
import { useKanbanDrag } from './hooks/useKanbanDrag';

function FloatingItem({
  draggingItem,
  x,
  y,
  visible,
}: {
  draggingItem: KanbanItemType;
  x: Animated.SharedValue<number>;
  y: Animated.SharedValue<number>;
  visible: Animated.SharedValue<boolean>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      position: 'absolute',
      left: x.value - 144,
      top: y.value - 60,
      zIndex: 9999,
      elevation: 10,
      opacity: visible.value ? 1 : 0,
      pointerEvents: 'none' as const,
    };
  });

  if (!draggingItem) return null;

  return (
    <Animated.View style={animatedStyle}>
      <View
        style={[
          tailwind.style('bg-white border-2 border-blue-400 rounded-lg p-3 shadow-2xl w-72'),
          {
            transform: [{ scale: 1.05 }],
          },
        ]}>
        <View style={tailwind.style('flex-row items-center justify-between mb-1')}>
          <Text
            style={tailwind.style('text-base font-inter-medium-24 text-gray-950 flex-1 mr-2')}
            numberOfLines={2}>
            {draggingItem.item_details?.title || draggingItem.title}
          </Text>
        </View>
        {draggingItem.item_details?.description && (
          <Text style={tailwind.style('text-sm text-gray-600 mt-1')} numberOfLines={2}>
            {draggingItem.item_details.description}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

type KanbanBoardScreenRouteProp = RouteProp<KanbanStackParamList, 'KanbanBoard'>;

export function KanbanBoardScreen() {
  const route = useRoute<KanbanBoardScreenRouteProp>();
  const dispatch = useAppDispatch();
  const { funnelId } = route.params;

  const funnel = useAppSelector(state => selectCurrentKanbanFunnel(state));
  const isLoading = useAppSelector(state => state.kanban.isLoading);
  const error = useAppSelector(state => state.kanban.error);

  const [draggingItem, setDraggingItem] = useState<KanbanItemType | null>(null);
  const floatingItemX = useSharedValue(0);
  const floatingItemY = useSharedValue(0);
  const isFloatingItemVisible = useSharedValue(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const editFunnelModalRef = useRef<BottomSheetModal>(null);
  const createStageModalRef = useRef<BottomSheetModal>(null);
  const stageLayoutsRef = useRef<
    Map<number, { x: number; y: number; width: number; height: number }>
  >(new Map());

  const scrollOffsetRef = useRef<number>(0);
  const scrollViewAbsolutePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  React.useEffect(() => {
    if (funnelId) {
      dispatch(kanbanActions.getFunnel(funnelId));
    }
  }, [dispatch, funnelId]);

  const handleRefresh = useCallback(() => {
    if (funnelId) {
      dispatch(kanbanActions.getFunnel(funnelId));
    }
  }, [dispatch, funnelId]);

  const handleItemUpdated = useCallback(() => {
    if (funnelId) {
      dispatch(kanbanActions.getFunnel(funnelId));
    }
  }, [dispatch, funnelId]);

  const handleEditFunnelPress = useCallback(() => {
    editFunnelModalRef.current?.present();
  }, []);

  const handleCreateStagePress = useCallback(() => {
    createStageModalRef.current?.present();
  }, []);

  const handleCreateStageSuccess = useCallback(() => {
    if (funnelId) {
      dispatch(kanbanActions.getFunnel(funnelId));
    }
  }, [dispatch, funnelId]);

  const handleCreateStageClose = useCallback(() => {
    createStageModalRef.current?.dismiss();
  }, []);

  const stages = useMemo(() => {
    return Array.isArray(funnel?.stages) ? funnel.stages : [];
  }, [funnel?.stages]);

  const sortedStages = useMemo(() => {
    return [...stages].sort((a, b) => a.position - b.position);
  }, [stages]);

  const { handleItemDragStart, handleItemDrag, handleItemDragEnd } = useKanbanDrag({
    draggingItem,
    setDraggingItem,
    funnelId,
    funnel: funnel ? { id: funnel.id, stages: sortedStages } : null,
    sortedStages,
    stageLayoutsRef,
    scrollViewAbsolutePositionRef,
    scrollOffsetRef,
    isFloatingItemVisible,
    floatingItemX,
    floatingItemY,
  });

  const handleStageLayout = useCallback(
    (stageId: number, layout: { x: number; y: number; width: number; height: number }) => {
      stageLayoutsRef.current.set(stageId, layout);
    },
    [],
  );

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.x;
  }, []);

  const handleScrollViewLayout = useCallback(
    (event: { nativeEvent: { layout: { x: number; y: number } } }) => {
      const { x, y } = event.nativeEvent.layout;
      scrollViewAbsolutePositionRef.current = { x, y };
      if (__DEV__) {
        logger.log('[ScrollView] Absolute position:', { x, y });
      }
    },
    [],
  );

  if (isLoading && !funnel) {
    return (
      <SafeAreaView style={tailwind.style('flex-1 bg-white justify-center items-center')}>
        <Spinner size={32} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={tailwind.style('flex-1 bg-white justify-center items-center p-4')}>
        <Text style={tailwind.style('text-red-600 text-center')}>{error}</Text>
        <Pressable
          onPress={handleRefresh}
          style={tailwind.style('mt-4 px-4 py-2 bg-blue-600 rounded-lg')}>
          <Text style={tailwind.style('text-white')}>Tentar Novamente</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!funnel) {
    return (
      <SafeAreaView style={tailwind.style('flex-1 bg-white justify-center items-center p-4')}>
        <Text style={tailwind.style('text-gray-600 text-center')}>Funil não encontrado</Text>
      </SafeAreaView>
    );
  }

  return (
    <KanbanErrorBoundary>
      <SafeAreaView style={tailwind.style('flex-1 bg-gray-50')}>
        <View
          style={tailwind.style(
            'px-4 py-3 mt-4 bg-white border-b border-gray-200 flex-row items-center justify-between',
          )}>
          <View style={tailwind.style('flex-1')}>
            <Text style={tailwind.style('text-xl font-semibold text-gray-900')}>{funnel.name}</Text>
          </View>

          <View style={tailwind.style('flex-row items-center')}>
            <Pressable
              onPress={handleCreateStagePress}
              style={tailwind.style('mr-3 p-2 rounded-lg bg-blue-600 active:bg-blue-700')}>
              <Icon size={20} icon={<Plus stroke="#FFFFFF" />} />
            </Pressable>

            <Pressable
              onPress={handleEditFunnelPress}
              style={tailwind.style('p-2 rounded-lg bg-gray-100 active:bg-gray-200')}>
              <Icon size={20} icon={<Overflow />} />
            </Pressable>
          </View>
        </View>

        {sortedStages.length === 0 && (
          <View style={tailwind.style('flex-1 items-center justify-center p-4')}>
            <Text style={tailwind.style('text-gray-500 text-center')}>
              Nenhuma etapa encontrada
            </Text>
          </View>
        )}

        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={true}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
          onScroll={handleScroll}
          onLayout={handleScrollViewLayout}
          scrollEventThrottle={16}
          style={tailwind.style('flex-1')}
          contentContainerStyle={tailwind.style('p-4')}>
          {sortedStages.map(stage => (
            <KanbanStage
              key={stage.id}
              stage={stage}
              funnelId={funnel.id}
              scrollViewRef={scrollViewRef}
              onItemDragStart={handleItemDragStart}
              onItemDragEnd={handleItemDragEnd}
              onItemDrag={handleItemDrag}
              onStageLayout={handleStageLayout}
              draggingItem={draggingItem}
              onItemUpdated={handleItemUpdated}
            />
          ))}
        </ScrollView>

        {draggingItem && (
          <FloatingItem
            draggingItem={draggingItem}
            x={floatingItemX}
            y={floatingItemY}
            visible={isFloatingItemVisible}
          />
        )}

        <EditFunnelModal funnel={funnel} sheetRef={editFunnelModalRef} onClose={handleRefresh} />
        <CreateStageModal
          sheetRef={createStageModalRef}
          funnelId={funnel.id}
          onClose={handleCreateStageClose}
          onSuccess={handleCreateStageSuccess}
        />
      </SafeAreaView>
    </KanbanErrorBoundary>
  );
}
