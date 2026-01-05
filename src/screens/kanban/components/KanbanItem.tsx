import { Icon } from '@/components-next';
import { Spinner } from '@/components-next/spinner';
import { ATTACHMENT_TYPES, MESSAGE_TYPES } from '@/constants';
import { useAppSelector } from '@/hooks';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import type { KanbanItem as KanbanItemType } from '@/store/kanban/kanbanTypes';
import { selectUnreadIncomingCount } from '@/store/kanban/notificationSelectors';
import { selectAllLabels } from '@/store/label/labelSelectors';
import { ClockIcon, MessageBubble, Overflow } from '@/svg-icons';
import { tailwind } from '@/theme';
import { getLastMessage } from '@/utils/conversationUtils';
import { formatRelativeTime, formatTimeToShortForm } from '@/utils/dateTimeUtils';
import { logger } from '@/utils/logger';
import { getPlainText } from '@/utils/messageFormatterUtils';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { StackActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { TIMEOUTS } from '../constants';
import { formatCurrency, getItemValue } from '../utils/kanbanHelpers';
import { EditItemModal } from './EditItemModal';
import { ManageAgentsModal } from './ManageAgentsModal';

interface KanbanItemProps {
  item: KanbanItemType;
  funnelId: number;
  stageId: number;
  onDragStart?: (item: KanbanItemType) => void;
  onDragEnd?: (
    item: KanbanItemType,
    position: { x: number; y: number; absoluteX?: number; absoluteY?: number },
  ) => void;
  onDrag?: (position: {
    x: number;
    y: number;
    translationX?: number;
    translationY?: number;
    relativeX?: number;
    relativeY?: number;
  }) => void;
  isDragging?: boolean;
  onItemUpdated?: () => void;
}

export const KanbanItem = React.memo(
  ({
    item,
    funnelId,
    stageId,
    onDragStart,
    onDragEnd,
    onDrag,
    isDragging = false,
    onItemUpdated,
  }: KanbanItemProps) => {
    const navigation = useNavigation();
    const editItemModalRef = useRef<BottomSheetModal>(null);
    const manageAgentsModalRef = useRef<BottomSheetModal>(null);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const startX = useSharedValue(0);
    const startY = useSharedValue(0);
    const isDraggingRef = useSharedValue(false);
    const isDraggingShared = useSharedValue(false);
    const dragUpdateCounter = useSharedValue(0);

    const conversationId =
      item.conversation_id || item.conversation?.id || item.item_details?.conversation_id;

    const linkedConversation = useAppSelector(state => {
      if (!conversationId) return null;
      return selectConversationById(state, conversationId);
    });

    const lastMessage = linkedConversation ? getLastMessage(linkedConversation) : null;
    const lastMessageContent = lastMessage?.content ? getPlainText(lastMessage.content) : null;

    const lastMessageMediaTag = useMemo(() => {
      if (!lastMessage) return null;

      const isActivity = lastMessage.messageType === MESSAGE_TYPES.ACTIVITY;
      if (isActivity) {
        const content = lastMessage.content?.toLowerCase() || '';

        if (
          content.includes('call') ||
          content.includes('ligação') ||
          content.includes('chamada') ||
          content.includes('missed call') ||
          content.includes('chamada perdida') ||
          content.includes('phone') ||
          content.includes('telefone')
        ) {
          return '[ligação]';
        }

        return null;
      }

      if (!lastMessage.attachments || lastMessage.attachments.length === 0) {
        return null;
      }

      const hasImage = lastMessage.attachments.some(
        attachment => attachment.fileType === ATTACHMENT_TYPES.IMAGE,
      );
      const hasVideo = lastMessage.attachments.some(
        attachment => attachment.fileType === ATTACHMENT_TYPES.VIDEO,
      );
      const hasAudio = lastMessage.attachments.some(
        attachment => attachment.fileType === ATTACHMENT_TYPES.AUDIO,
      );
      const hasFile = lastMessage.attachments.some(
        attachment => attachment.fileType === ATTACHMENT_TYPES.FILE,
      );
      const hasLocation = lastMessage.attachments.some(
        attachment => attachment.fileType === ATTACHMENT_TYPES.LOCATION,
      );
      const hasContact = lastMessage.attachments.some(
        attachment => attachment.fileType === ATTACHMENT_TYPES.CONTACT,
      );

      if (hasImage) return '[imagem]';
      if (hasVideo) return '[vídeo]';
      if (hasAudio) return '[audio]';
      if (hasFile) return '[arquivo]';
      if (hasLocation) return '[localização]';
      if (hasContact) return '[contato]';

      return null;
    }, [lastMessage]);

    const unreadIncomingCount = useAppSelector(state =>
      selectUnreadIncomingCount(state, conversationId),
    );
    const hasUnreadMessages = unreadIncomingCount > 0;

    // Buscar labels da conversa associada
    const allLabels = useAppSelector(selectAllLabels);
    const activeLabels = useMemo(() => {
      const conversationLabels = linkedConversation?.labels || [];
      if (!allLabels || !conversationLabels || conversationLabels.length === 0) return [];
      return allLabels.filter(label => conversationLabels.includes(label.title));
    }, [allLabels, linkedConversation?.labels]);

    const waitingSince = linkedConversation?.waitingSince;
    const waitingTimeText = waitingSince
      ? formatTimeToShortForm(formatRelativeTime(waitingSince))
      : null;

    const handleOpenConversation = useCallback(() => {
      if (conversationId && !isDragging) {
        try {
          navigation.dispatch(
            StackActions.push('ChatScreen', {
              conversationId: Number(conversationId),
            }),
          );
        } catch (error) {
          logger.error('Error navigating to ChatScreen:', error);
        }
      }
    }, [conversationId, isDragging, navigation]);

    const handleMenuPress = useCallback(
      (e?: GestureResponderEvent) => {
        e?.stopPropagation?.();
        if (!isDragging && item.id) {
          setSelectedItemId(item.id);
          editItemModalRef.current?.present();
        }
      },
      [isDragging, item.id],
    );

    const panGesture = Gesture.Pan()
      .activateAfterLongPress(1000)
      .minPointers(1)
      .minDistance(10)
      .activeOffsetX([-15, 15])
      .activeOffsetY([-15, 15])
      .onStart(event => {
        'worklet';
        isDraggingRef.value = true;
        isDraggingShared.value = true;
        scale.value = 1.05;
        opacity.value = 0.5;
        startX.value = translateX.value;
        startY.value = translateY.value;
        dragUpdateCounter.value = 0;
        if (onDragStart) {
          runOnJS(onDragStart)(item);
        }
        if (onDrag) {
          runOnJS(onDrag)({ x: event.absoluteX, y: event.absoluteY });
        }
      })
      .onUpdate(event => {
        'worklet';
        translateX.value = startX.value + event.translationX;
        translateY.value = startY.value + event.translationY;

        if (onDrag) {
          runOnJS(onDrag)({
            x: event.absoluteX,
            y: event.absoluteY,
            translationX: event.translationX,
            translationY: event.translationY,
            relativeX: event.x,
            relativeY: event.y,
          });
        }
      })
      .onEnd(event => {
        'worklet';
        const relativeX = event.x;
        const relativeY = event.y;
        const absoluteX = event.absoluteX;
        const absoluteY = event.absoluteY;
        const wasDragging = isDraggingRef.value;
        isDraggingRef.value = false;
        isDraggingShared.value = false;

        if (onDragEnd && wasDragging) {
          runOnJS(onDragEnd)(item, { x: relativeX, y: relativeY, absoluteX, absoluteY });
        }

        scale.value = 1;
        opacity.value = 1;
        translateX.value = 0;
        translateY.value = 0;
        startX.value = 0;
        startY.value = 0;
      })
      .onFinalize(() => {
        'worklet';
        isDraggingRef.value = false;
        isDraggingShared.value = false;
        scale.value = 1;
        opacity.value = 1;
        translateX.value = 0;
        translateY.value = 0;
        startX.value = 0;
        startY.value = 0;
      });

    const animatedStyle = useAnimatedStyle(() => {
      'worklet';
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { scale: scale.value },
        ],
        opacity: isDraggingShared.value ? 0 : opacity.value,
        zIndex: isDraggingShared.value ? 1000 : 1,
        elevation: isDraggingShared.value ? 10 : 0,
      };
    });

    const handleEditItemClose = useCallback(() => {
      setSelectedItemId(null);
    }, []);

    const formatDate = useCallback((dateString?: string) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }, []);

    const isOverdue = item.due_date && new Date(item.due_date) < new Date();

    // Obter valor do item e formatação
    const itemValue = useMemo(() => getItemValue(item), [item]);
    const formattedValue = useMemo(() => {
      if (itemValue === null) return null;
      const currency = item.item_details?.currency || { symbol: 'R$', locale: 'pt-BR' };
      return formatCurrency(itemValue, currency, false);
    }, [itemValue, item.item_details?.currency]);

    // Formatar iniciais dos agentes individualmente
    const agentInitialsList = useMemo(() => {
      if (!item.assigned_agents || item.assigned_agents.length === 0) return [];
      return item.assigned_agents.map(agent => {
        const parts = agent.name.trim().split(/\s+/);
        if (parts.length >= 2) {
          return `${parts[0].charAt(0).toUpperCase()}${parts[parts.length - 1].charAt(0).toUpperCase()}`;
        }
        return parts[0].charAt(0).toUpperCase();
      });
    }, [item.assigned_agents]);

    const handleOpenManageAgents = useCallback(() => {
      if (!isDragging) {
        manageAgentsModalRef.current?.present();
      }
    }, [isDragging]);

    const handleAgentsUpdated = useCallback(() => {
      setIsUpdating(false);
      if (onItemUpdated) {
        onItemUpdated();
      }
    }, [onItemUpdated]);


    const handleItemUpdateStart = useCallback(() => {
      setIsUpdating(true);
      
      // Timeout de segurança: resetar após 10 segundos se não terminar
      setTimeout(() => {
        setIsUpdating(false);
      }, TIMEOUTS.UPDATE_SAFETY);
    }, []);

    const handleItemUpdated = useCallback(() => {
      setIsUpdating(false);
      if (onItemUpdated) {
        onItemUpdated();
      }
    }, [onItemUpdated]);

    return (
      <>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={animatedStyle}>
            <View
              style={tailwind.style(
                'bg-white border border-gray-200 rounded-lg p-3 mb-2 shadow-sm',
              )}>
              <View style={tailwind.style('flex-row items-center justify-between mb-1')}>
                <View style={tailwind.style('flex-row items-center flex-1 mr-2')}>
                  <Text
                    style={tailwind.style('text-base font-inter-medium-24 text-gray-950 flex-1')}
                    numberOfLines={2}>
                    {item.title}
                  </Text>
                  {waitingTimeText && (
                    <View style={tailwind.style('flex-row items-center ml-2')}>
                      <Icon
                        size={14}
                        icon={<ClockIcon stroke="#9CA3AF" strokeWidth={1.5} />}
                        style={tailwind.style('mr-1')}
                      />
                      <Text style={tailwind.style('text-xs text-gray-500 font-inter-normal-20')}>
                        {waitingTimeText}
                      </Text>
                    </View>
                  )}
                </View>
                <Pressable
                  onPress={handleMenuPress}
                  style={tailwind.style('p-1 opacity-60')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Icon size={16} icon={<Overflow stroke="#858585" />} />
                </Pressable>
              </View>

              {conversationId && (lastMessageContent || lastMessageMediaTag) && (
                <Pressable
                  onPress={handleOpenConversation}
                  style={tailwind.style(
                    'mb-2 flex-row items-center border-blue-400 border-[0.5px] p-2 rounded-md',
                  )}>
                  <View style={tailwind.style('mr-2 justify-center')}>
                    <Icon
                      size={18}
                      icon={<MessageBubble fill="#FFFFFF" stroke="#3B82F6" strokeWidth={1.5} />}
                    />
                  </View>
                  <Text
                    style={tailwind.style('text-sm text-blue-600 font-inter-normal-20 flex-1')}
                    numberOfLines={1}>
                    {lastMessageMediaTag
                      ? lastMessageContent
                        ? `${lastMessageContent} ${lastMessageMediaTag}`
                        : lastMessageMediaTag
                      : lastMessageContent}
                  </Text>
                  {hasUnreadMessages && (
                    <View
                      style={tailwind.style(
                        'ml-2 w-5 h-5 rounded-full bg-green-500 items-center justify-center',
                      )}>
                      <Text
                        style={tailwind.style('text-xs text-white font-inter-semibold-20')}
                        numberOfLines={1}>
                        {unreadIncomingCount > 99 ? '99+' : unreadIncomingCount.toString()}
                      </Text>
                    </View>
                  )}
                </Pressable>
              )}

              {item.description && (
                <Text style={tailwind.style('text-sm text-gray-600 mb-2')} numberOfLines={2}>
                  {item.description}
                </Text>
              )}

              <View style={tailwind.style('flex-row items-center justify-between mt-2')}>
                <View style={tailwind.style('flex-row items-center flex-1 flex-wrap')}>
                  {/* Iniciais dos agentes separadas e clicáveis */}
                  {agentInitialsList.length > 0 && (
                    <View style={tailwind.style('flex-row items-center flex-wrap')}>
                      {agentInitialsList.map((initials, index) => (
                        <Pressable
                          key={`${item.id}-agent-${index}`}
                          onPress={handleOpenManageAgents}
                          style={tailwind.style('px-2 py-1 bg-gray-100 rounded mr-1 mb-1')}>
                          <Text
                            style={tailwind.style('text-xs text-gray-700 font-inter-medium-24')}>
                            {initials}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {formattedValue && (
                    <View style={tailwind.style('px-2 py-1 bg-blue-50 rounded mr-2 mb-1')}>
                      <Text style={tailwind.style('text-xs text-blue-700 font-inter-medium-24')}>
                        {formattedValue}
                      </Text>
                    </View>
                  )}

                  {item.due_date && (
                    <View
                      style={tailwind.style(
                        `px-2 py-1 rounded mb-1 ${isOverdue ? 'bg-red-100' : 'bg-gray-100'}`,
                      )}>
                      <Text
                        style={tailwind.style(
                          `text-xs ${isOverdue ? 'text-red-800' : 'text-gray-600'}`,
                        )}>
                        {formatDate(item.due_date)}
                      </Text>
                    </View>
                  )}

                  {/* Labels da conversa */}
                  {activeLabels.length > 0 && (
                    <View style={tailwind.style('flex-row items-center flex-wrap')}>
                      {activeLabels.map((label, index) => (
                        <View
                          key={`${item.id}-label-${index}`}
                          style={[
                            tailwind.style('px-2 py-1 rounded mb-1 mr-1 flex-row items-center'),
                            { backgroundColor: `${label.color}20` },
                          ]}>
                          <View
                            style={[
                              tailwind.style('w-1.5 h-1.5 rounded-full mr-1.5'),
                              { backgroundColor: label.color },
                            ]}
                          />
                          <Text
                            style={[
                              tailwind.style('text-xs font-inter-medium-24'),
                              { color: label.color },
                            ]}>
                            {label.title}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Overlay de loading quando está atualizando */}
              {isUpdating && (
                <View
                  style={tailwind.style(
                    'absolute inset-0 bg-white/80 rounded-lg items-center justify-center',
                  )}>
                  <Spinner size={24} />
                  <Text style={tailwind.style('text-xs text-gray-600 mt-2')}>
                    Atualizando...
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        </GestureDetector>

        <EditItemModal
          itemId={selectedItemId}
          funnelId={funnelId}
          sheetRef={editItemModalRef}
          onClose={handleEditItemClose}
          onItemUpdateStart={handleItemUpdateStart}
          onItemUpdated={handleItemUpdated}
          initialItem={selectedItemId === item.id ? item : null}
        />

        <ManageAgentsModal
          item={item}
          sheetRef={manageAgentsModalRef}
          onClose={() => {}}
          onAgentsUpdated={handleAgentsUpdated}
        />
      </>
    );
  },
  (prevProps, nextProps) => {
    // Se a referência do item mudou (ex: update no Redux), re-renderiza
    if (prevProps.item !== nextProps.item) return false;

    // Se props de controle visual mudaram
    return (
      prevProps.isDragging === nextProps.isDragging &&
      prevProps.stageId === nextProps.stageId &&
      prevProps.funnelId === nextProps.funnelId
    );
  },
);

KanbanItem.displayName = 'KanbanItem';
