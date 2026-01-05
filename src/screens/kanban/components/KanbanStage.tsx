import { Icon } from '@/components-next';
import { useAppSelector } from '@/hooks';
import type {
    KanbanItem as KanbanItemType,
    KanbanStage as KanbanStageType,
} from '@/store/kanban/kanbanTypes';
import { selectUnreadIncomingCount } from '@/store/kanban/notificationSelectors';
import { Overflow } from '@/svg-icons';
import { tailwind } from '@/theme';
import { logger } from '@/utils/logger';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { StackActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { findNodeHandle, Pressable, ScrollView, Text, View } from 'react-native';
import { calculateStageStats, formatCurrency, getItemValue } from '../utils/kanbanHelpers';
import { EditStageModal } from './EditStageModal';
import { KanbanItem } from './KanbanItem';

interface KanbanStageProps {
  stage: KanbanStageType;
  funnelId: number;
  scrollViewRef?: React.RefObject<ScrollView>;
  onItemDragStart?: (item: KanbanItemType) => void;
  onItemDragEnd?: (item: KanbanItemType, position: { x: number; y: number }) => void;
  onStageLayout?: (
    stageId: number,
    layout: { x: number; y: number; width: number; height: number },
  ) => void;
  draggingItem?: KanbanItemType | null;
  onItemDrag?: (position: { x: number; y: number }) => void;
  onItemUpdated?: () => void;
}

const getConversationId = (item: KanbanItemType): number | undefined => {
  return item.conversation_id || item.conversation?.id || item.item_details?.conversation_id;
};

export const KanbanStage = React.memo(
  ({
    stage,
    funnelId,
    scrollViewRef,
    onItemDragStart,
    onItemDragEnd,
    onStageLayout,
    draggingItem,
    onItemDrag,
    onItemUpdated,
  }: KanbanStageProps) => {
    const navigation = useNavigation();
    const stageRef = useRef<View>(null);
    const editStageModalRef = useRef<BottomSheetModal>(null);
    const [selectedStage, setSelectedStage] = useState<KanbanStageType | null>(null);

    const handleAddItem = useCallback(() => {
      navigation.dispatch(
        StackActions.push('CreateKanbanItem', {
          funnelId,
          stageId: stage.id,
          stageKey: stage.stage_key,
        }),
      );
    }, [navigation, funnelId, stage.id, stage.stage_key]);

    const handleStageMenu = useCallback(() => {
      setSelectedStage(stage);
      editStageModalRef.current?.present();
    }, [stage]);

    const handleEditStageClose = useCallback(() => {
      setSelectedStage(null);
    }, []);

    const getStageStatus = useMemo(() => {
      return 'Aberto';
    }, []);

    const updateLayout = useCallback(() => {
      if (stageRef.current && onStageLayout && scrollViewRef?.current) {
        try {
          const scrollViewHandle = findNodeHandle(scrollViewRef.current);
          if (scrollViewHandle) {
            stageRef.current.measureLayout(
              scrollViewHandle,
              (x: number, y: number, width: number, height: number) => {
                if (__DEV__) {
                  logger.log(`[Stage ${stage.name}] measureLayout result:`, {
                    x,
                    y,
                    width,
                    height,
                  });
                }
                onStageLayout(stage.id, { x, y, width, height });
              },
              () => {
                logger.error(`[Stage ${stage.name}] measureLayout failed`);
              },
            );
          }
        } catch (error) {
          logger.error(`[Stage ${stage.name}] measureLayout error:`, error);
        }
      }
    }, [stage.id, stage.name, onStageLayout, scrollViewRef]);

    useEffect(() => {
      updateLayout();
    }, [updateLayout]);

    const handleLayout = useCallback(() => {
      updateLayout();
    }, [updateLayout]);

    const isDropTarget = draggingItem && draggingItem.stage_id !== stage.id;

    const items = useMemo(() => stage.items || [], [stage.items]);

    const conversationsNotificationMap = useAppSelector(
      state => {
        const map: Record<number, { count: number; hasNotifications: boolean }> = {};
        items.forEach(item => {
          const conversationId = getConversationId(item);
          if (conversationId) {
            const count = selectUnreadIncomingCount(state, conversationId);
            map[conversationId] = { count, hasNotifications: count > 0 };
          }
        });
        return map;
      },
      (a, b) => {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        for (const key of keysA) {
          // @ts-ignore
          if (!b[key] || a[key].count !== b[key].count) return false;
        }
        return true;
      },
    );

    const { unreadItems, readItems } = useMemo(() => {
      const unread: KanbanItemType[] = [];
      const read: KanbanItemType[] = [];

      items.forEach(item => {
        const conversationId = getConversationId(item);
        const notificationInfo = conversationId
          ? conversationsNotificationMap[conversationId]
          : { count: 0, hasNotifications: false };

        if (notificationInfo.hasNotifications) {
          unread.push(item);
        } else {
          read.push(item);
        }
      });

      unread.sort((a, b) => (a.position || 0) - (b.position || 0));
      read.sort((a, b) => (a.position || 0) - (b.position || 0));

      return { unreadItems: unread, readItems: read };
    }, [items, conversationsNotificationMap]);

    const [notificationsExpanded, setNotificationsExpanded] = useState(true);
    const [listExpanded, setListExpanded] = useState(true);

    // Calcular estatísticas da etapa
    const stageStats = useMemo(() => {
      return calculateStageStats(items);
    }, [items]);

    // Obter símbolo de moeda do primeiro item (assumindo que todos usam a mesma moeda)
    const currencySymbol = useMemo(() => {
      const firstItemWithValue = items.find(item => {
        const value = getItemValue(item);
        return value !== undefined && value !== null;
      });
      return firstItemWithValue?.item_details?.currency?.symbol || 'R$';
    }, [items]);

    return (
      <>
        <View
          ref={stageRef}
          onLayout={handleLayout}
          style={tailwind.style(
            `w-72 bg-white rounded-lg mr-4 shadow-sm border flex-shrink-0 ${
              isDropTarget ? 'border-blue-400 border-2' : 'border-gray-200'
            }`,
          )}>
          <View style={tailwind.style('px-4 py-3 border-b border-gray-200')}>
            <View style={tailwind.style('flex-row items-center justify-between mb-2')}>
              <View style={tailwind.style('flex-row items-center flex-1')}>
                {stage.color && (
                  <View
                    style={[
                      tailwind.style('w-3 h-3 rounded-full mr-2'),
                      { backgroundColor: stage.color },
                    ]}
                  />
                )}
                <Text
                  style={tailwind.style('text-base font-inter-semibold-20 text-gray-950 flex-1')}>
                  {stage.name}
                </Text>
              </View>
              <View style={tailwind.style('flex-row items-center gap-2')}>
                <View
                  style={tailwind.style(
                    'px-2 py-1 bg-gray-100 rounded-md flex-row items-center gap-1',
                  )}>
                  <View style={tailwind.style('w-2 h-2 rounded-full bg-green-500')} />
                  <Text style={tailwind.style('text-xs text-gray-950 font-inter-medium-24')}>
                    {getStageStatus}
                  </Text>
                </View>
                <Pressable onPress={handleStageMenu} style={tailwind.style('p-1')}>
                  <Icon size={20} icon={<Overflow />} />
                </Pressable>
              </View>
            </View>

            {/* Estatísticas da etapa */}
            <View style={tailwind.style('flex-row items-center gap-3')}>
              {stageStats.uniqueAgentsCount > 0 && (
                <Text style={tailwind.style('text-xs text-gray-600 font-inter-normal-20')}>
                  {stageStats.uniqueAgentsCount}{' '}
                  {stageStats.uniqueAgentsCount === 1 ? 'agente' : 'agentes'}
                </Text>
              )}
              <Text style={tailwind.style('text-xs text-gray-600 font-inter-normal-20')}>
                {stageStats.itemCount} {stageStats.itemCount === 1 ? 'item' : 'itens'}
              </Text>
              {stageStats.totalValue > 0 && (
                <Text style={tailwind.style('text-xs text-gray-950 font-inter-medium-24')}>
                  {formatCurrency(stageStats.totalValue, { symbol: currencySymbol }, true)}
                </Text>
              )}
            </View>
          </View>

          <ScrollView
            style={tailwind.style('flex-1')}
            contentContainerStyle={tailwind.style('p-3')}
            showsVerticalScrollIndicator={false}>
            {unreadItems.length > 0 && (
              <View style={tailwind.style('mb-4')}>
                <Pressable
                  onPress={() => setNotificationsExpanded(!notificationsExpanded)}
                  style={tailwind.style('flex-row items-center mb-3')}>
                  <Text style={tailwind.style('text-xs font-inter-medium-24 text-gray-500 mr-2')}>
                    NOTIFICAÇÕES
                  </Text>
                  <View style={tailwind.style('flex-1 h-[1px] bg-gray-300')} />
                </Pressable>
                {notificationsExpanded && (
                  <View>
                    {unreadItems.map(item => (
                      <KanbanItem
                        key={item.id}
                        item={item}
                        funnelId={funnelId}
                        stageId={stage.id}
                        onDragStart={onItemDragStart}
                        onDragEnd={onItemDragEnd}
                        onDrag={onItemDrag}
                        isDragging={draggingItem?.id === item.id}
                        onItemUpdated={onItemUpdated}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

            {readItems.length > 0 && (
              <View style={tailwind.style('mb-3')}>
                <Pressable
                  onPress={() => setListExpanded(!listExpanded)}
                  style={tailwind.style('flex-row items-center mb-3')}>
                  <Text style={tailwind.style('text-xs font-inter-medium-24 text-gray-500 mr-2')}>
                    LISTA
                  </Text>
                  <View style={tailwind.style('flex-1 h-[1px] bg-gray-300')} />
                </Pressable>
                {listExpanded && (
                  <View>
                    {readItems.map(item => (
                      <KanbanItem
                        key={item.id}
                        item={item}
                        funnelId={funnelId}
                        stageId={stage.id}
                        onDragStart={onItemDragStart}
                        onDragEnd={onItemDragEnd}
                        onDrag={onItemDrag}
                        isDragging={draggingItem?.id === item.id}
                        onItemUpdated={onItemUpdated}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

            {unreadItems.length === 0 && readItems.length === 0 && (
              <View>
                {items
                  .sort((a, b) => (a.position || 0) - (b.position || 0))
                  .map(item => (
                    <KanbanItem
                      key={item.id}
                      item={item}
                      funnelId={funnelId}
                      stageId={stage.id}
                      onDragStart={onItemDragStart}
                      onDragEnd={onItemDragEnd}
                      onDrag={onItemDrag}
                      isDragging={draggingItem?.id === item.id}
                      onItemUpdated={onItemUpdated}
                    />
                  ))}
              </View>
            )}

            <Pressable
              onPress={handleAddItem}
              style={tailwind.style(
                'mt-2 mx-3 p-3 border-2 border-dashed border-gray-300 rounded-lg items-center',
              )}>
              <Text style={tailwind.style('text-sm text-gray-500 font-inter-medium-24')}>
                + Adicionar Item
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        <EditStageModal
          stage={selectedStage}
          funnelId={funnelId}
          sheetRef={editStageModalRef}
          onClose={handleEditStageClose}
          onSuccess={onItemUpdated}
        />
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.stage === nextProps.stage &&
      prevProps.draggingItem === nextProps.draggingItem &&
      prevProps.funnelId === nextProps.funnelId
    );
  },
);

KanbanStage.displayName = 'KanbanStage';
