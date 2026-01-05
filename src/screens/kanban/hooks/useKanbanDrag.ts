import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch } from '@/hooks';
import { kanbanActions } from '@/store/kanban/kanbanActions';
import type { KanbanItem } from '@/store/kanban/kanbanTypes';
import { logger } from '@/utils/logger';

interface UseKanbanDragProps {
  draggingItem: KanbanItem | null;
  setDraggingItem: (item: KanbanItem | null) => void;
  funnelId: number;
  funnel: { id: number; stages?: Array<{ id: number; stage_key?: string; position: number; name?: string }> } | null;
  sortedStages: Array<{ id: number; stage_key?: string; position: number; name?: string }>;
  stageLayoutsRef: React.MutableRefObject<Map<number, { x: number; y: number; width: number; height: number }>>;
  scrollViewAbsolutePositionRef: React.MutableRefObject<{ x: number; y: number }>;
  scrollOffsetRef: React.MutableRefObject<number>;
  isFloatingItemVisible: { value: boolean };
  floatingItemX: { value: number };
  floatingItemY: { value: number };
}

export function useKanbanDrag({
  draggingItem,
  setDraggingItem,
  funnelId,
  funnel,
  sortedStages,
  stageLayoutsRef,
  scrollViewAbsolutePositionRef,
  scrollOffsetRef,
  isFloatingItemVisible,
  floatingItemX,
  floatingItemY,
}: UseKanbanDragProps) {
  const dispatch = useAppDispatch();
  const lastDetectedStageRef = useRef<string | null>(null);
  const dragDetectionThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (dragDetectionThrottleRef.current) {
        clearTimeout(dragDetectionThrottleRef.current);
        dragDetectionThrottleRef.current = null;
      }
    };
  }, []);

  const handleItemDragStart = useCallback(
    (item: KanbanItem) => {
      if (draggingItem) {
        if (__DEV__) {
          logger.log('[Drag] Ignoring drag start - another item is already being dragged');
        }
        return;
      }
      setDraggingItem(item);
      isFloatingItemVisible.value = true;
      lastDetectedStageRef.current = null;
    },
    [draggingItem, setDraggingItem, isFloatingItemVisible],
  );

  const handleItemDrag = useCallback(
    (position: {
      x: number;
      y: number;
      translationX?: number;
      translationY?: number;
      relativeX?: number;
      relativeY?: number;
    }) => {
      floatingItemX.value = position.x;
      floatingItemY.value = position.y;

      if (dragDetectionThrottleRef.current !== null) {
        return;
      }

      dragDetectionThrottleRef.current = setTimeout(() => {
        dragDetectionThrottleRef.current = null;

        if (!draggingItem || !funnel || sortedStages.length === 0) {
          return;
        }

        const currentItem = draggingItem;
        const currentStageKey = currentItem.funnel_stage || currentItem.stage_key;

        let dropX: number;
        if (position.x !== undefined) {
          const relativeToScrollView = position.x - scrollViewAbsolutePositionRef.current.x;
          dropX = relativeToScrollView + scrollOffsetRef.current;

          if (__DEV__) {
            logger.log('[Drag] Position calc:', {
              absoluteX: position.x,
              scrollViewX: scrollViewAbsolutePositionRef.current.x,
              relativeToScrollView,
              scrollOffset: scrollOffsetRef.current,
              dropX,
            });
          }
        } else {
          if (__DEV__) {
            logger.log('[Drag] No position data available');
          }
          return;
        }

        const stageRanges = sortedStages
          .map(stage => {
            const layout = stageLayoutsRef.current.get(stage.id);
            if (!layout || !stage.stage_key) return null;

            const isDropTarget = currentItem.stage_id !== stage.id;

            return {
              stageKey: stage.stage_key,
              stageName: stage.name || stage.stage_key,
              stageId: stage.id,
              startX: layout.x,
              endX: layout.x + layout.width,
              centerX: layout.x + layout.width / 2,
              isDropTarget,
            };
          })
          .filter((range): range is NonNullable<typeof range> => range !== null);

        let targetStageKey: string | null = null;

        for (const range of stageRanges) {
          if (range.isDropTarget && dropX >= range.startX && dropX <= range.endX) {
            targetStageKey = range.stageKey;
            if (__DEV__) {
              logger.log(`[Drag] Found exact match: ${range.stageName} (${range.stageKey})`);
            }
            break;
          }
        }

        if (!targetStageKey) {
          let minDistance = Infinity;
          for (const range of stageRanges) {
            if (!range.isDropTarget) {
              continue;
            }

            const distance = Math.abs(dropX - range.centerX);
            if (distance < minDistance) {
              minDistance = distance;
              targetStageKey = range.stageKey;
            }
          }
        }

        if (targetStageKey && targetStageKey !== currentStageKey) {
          if (lastDetectedStageRef.current !== targetStageKey) {
            lastDetectedStageRef.current = targetStageKey;
            if (__DEV__) {
              logger.log(
                `[Drag] Moving item from ${currentStageKey} to ${targetStageKey} (dropX: ${dropX})`,
              );
            }

            dispatch(
              kanbanActions.moveKanbanItemToStage({
                itemId: currentItem.id,
                funnelStage: targetStageKey,
                funnelId: funnel.id,
              }),
            )
              .then(() => {
                if (funnelId) {
                  dispatch(kanbanActions.getFunnel(funnelId));
                }
              })
              .catch((error) => {
                logger.error('[Drag] Error moving item to stage:', error);
              });
          }
        } else {
          lastDetectedStageRef.current = null;
        }
      }, 100);
    },
    [
      draggingItem,
      dispatch,
      funnelId,
      funnel,
      sortedStages,
      floatingItemX,
      floatingItemY,
      stageLayoutsRef,
      scrollViewAbsolutePositionRef,
      scrollOffsetRef,
    ],
  );

  const performDropDetection = useCallback(
    (dropX: number, dropY: number, item: KanbanItem) => {
      if (!draggingItem || !funnel) {
        setDraggingItem(null);
        isFloatingItemVisible.value = false;
        return;
      }

      const stageRanges = sortedStages
        .map(stage => {
          const layout = stageLayoutsRef.current.get(stage.id);
          if (!layout || !stage.stage_key) return null;

          if (__DEV__) {
            logger.log(`[DragEnd] Stage ${stage.name || stage.stage_key} (${stage.stage_key}) layout:`, layout);
          }

          return {
            stageKey: stage.stage_key,
            stageName: stage.name || stage.stage_key,
            startX: layout.x,
            endX: layout.x + layout.width,
            centerX: layout.x + layout.width / 2,
            startY: layout.y,
            endY: layout.y + layout.height,
            position: stage.position,
          };
        })
        .filter((range): range is NonNullable<typeof range> => range !== null)
        .sort((a, b) => a.position - b.position);

      if (__DEV__) {
        logger.log('[DragEnd] Stage ranges:', stageRanges);
      }

      if (stageRanges.length === 0) {
        if (__DEV__) {
          logger.log('[DragEnd] No stage ranges found');
        }
        setDraggingItem(null);
        isFloatingItemVisible.value = false;
        return;
      }

      let targetStageKey: string | null = null;

      for (const range of stageRanges) {
        if (dropX >= range.startX && dropX <= range.endX) {
          targetStageKey = range.stageKey;
          if (__DEV__) {
            logger.log(`[DragEnd] Found exact match: ${range.stageName} (${range.stageKey})`);
          }
          break;
        }
      }

      if (!targetStageKey) {
        if (__DEV__) {
          logger.log('[DragEnd] No exact match, finding nearest stage');
        }
        let minDistance = Infinity;
        for (const range of stageRanges) {
          const distance = Math.abs(dropX - range.centerX);
          if (distance < minDistance) {
            minDistance = distance;
            targetStageKey = range.stageKey;
            if (__DEV__) {
              logger.log(
                `[DragEnd] Closest so far: ${range.stageName} (${range.stageKey}), distance: ${distance}`,
              );
            }
          }
        }
      }

      const currentItem = item || draggingItem;
      const currentStageKey = currentItem.funnel_stage || currentItem.stage_key;

      if (__DEV__) {
        logger.log('[DragEnd] Item from parameter:', item);
        logger.log('[DragEnd] Dragging item:', draggingItem);
        logger.log('[DragEnd] Current item used:', currentItem);
        logger.log('[DragEnd] Target stage:', targetStageKey);
        logger.log('[DragEnd] Current stage (funnel_stage):', currentItem.funnel_stage);
        logger.log('[DragEnd] Current stage (stage_key):', currentItem.stage_key);
        logger.log('[DragEnd] Current stage (resolved):', currentStageKey);
        logger.log('[DragEnd] Comparison:', {
          targetStageKey,
          currentStageKey,
          areEqual: currentStageKey === targetStageKey,
          funnelStageMatch: currentItem.funnel_stage === targetStageKey,
          stageKeyMatch: currentItem.stage_key === targetStageKey,
        });
      }

      if (targetStageKey && currentStageKey !== targetStageKey) {
        if (__DEV__) {
          logger.log('[DragEnd] Moving item to stage:', targetStageKey);
        }
        dispatch(
          kanbanActions.moveKanbanItemToStage({
            itemId: currentItem.id,
            funnelStage: targetStageKey,
            funnelId: funnel.id,
          }),
        )
          .then(() => {
            if (funnelId) {
              dispatch(kanbanActions.getFunnel(funnelId));
            }
          })
          .catch((error) => {
            logger.error('[DragEnd] Error moving item to stage:', error);
          });
      } else {
        if (!targetStageKey) {
          if (__DEV__) {
            logger.log('[DragEnd] Not moving item: invalid target stage');
          }
        } else {
          if (__DEV__) {
            logger.log(
              `[DragEnd] Not moving item: same stage (current: ${currentStageKey}, target: ${targetStageKey})`,
            );
          }
        }
      }

      setDraggingItem(null);
      isFloatingItemVisible.value = false;
    },
    [
      draggingItem,
      dispatch,
      funnelId,
      funnel,
      sortedStages,
      isFloatingItemVisible,
      stageLayoutsRef,
      setDraggingItem,
    ],
  );

  const handleItemDragEnd = useCallback(
    (
      item: KanbanItem,
      position: { x: number; y: number; absoluteX?: number; absoluteY?: number },
    ) => {
      if (!draggingItem || !funnel) {
        setDraggingItem(null);
        isFloatingItemVisible.value = false;
        return;
      }

      if (__DEV__) {
        logger.log('[DragEnd] Position (relative):', { x: position.x, y: position.y });
        logger.log('[DragEnd] Position (absolute):', {
          x: position.absoluteX,
          y: position.absoluteY,
        });
        logger.log('[DragEnd] Scroll offset:', scrollOffsetRef.current);
      }

      const currentItem = item || draggingItem;
      const currentStageKey = currentItem.funnel_stage || currentItem.stage_key;
      const currentItemStage = sortedStages.find(stage => stage.stage_key === currentStageKey);

      let dropX: number;
      if (currentItemStage) {
        const stageLayout = stageLayoutsRef.current.get(currentItemStage.id);
        if (stageLayout) {
          dropX = stageLayout.x + position.x + scrollOffsetRef.current;

          if (__DEV__) {
            logger.log('[DragEnd] Using stage-based calculation:', {
              stageName: currentItemStage.name || currentItemStage.stage_key,
              stageLayoutX: stageLayout.x,
              positionX: position.x,
              scrollOffset: scrollOffsetRef.current,
              calculatedDropX: dropX,
            });
          }
        } else {
          dropX = position.x + scrollOffsetRef.current;
          if (__DEV__) {
            logger.log('[DragEnd] Using fallback calculation (no stage layout)');
          }
        }
      } else {
        dropX = position.x + scrollOffsetRef.current;
        if (__DEV__) {
          logger.log('[DragEnd] Using fallback calculation (no current stage found)');
        }
      }

      const dropY = position.y;

      if (__DEV__) {
        logger.log('[DragEnd] Calculated drop position:', { dropX, dropY });
      }

      performDropDetection(dropX, dropY, item);
    },
    [
      draggingItem,
      dispatch,
      funnelId,
      funnel,
      sortedStages,
      isFloatingItemVisible,
      performDropDetection,
      stageLayoutsRef,
      scrollOffsetRef,
      setDraggingItem,
    ],
  );

  useEffect(() => {
    if (!draggingItem) {
      lastDetectedStageRef.current = null;
    }
  }, [draggingItem]);

  return {
    handleItemDragStart,
    handleItemDrag,
    handleItemDragEnd,
  };
}

