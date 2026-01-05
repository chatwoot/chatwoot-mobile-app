import { useAppSelector } from '@/hooks';
import {
    selectCurrentKanbanItem,
    selectKanbanItemById,
} from '@/store/kanban/kanbanSelectors';
import type { KanbanItem } from '@/store/kanban/kanbanTypes';
import { useMemo } from 'react';

interface UseItemSyncOptions {
  itemId: number | null;
  initialItem?: KanbanItem | null;
}

interface UseItemSyncResult {
  item: KanbanItem | null;
  isLoading: boolean;
}

export function useItemSync({ itemId, initialItem }: UseItemSyncOptions): UseItemSyncResult {
  const currentItem = useAppSelector(selectCurrentKanbanItem);
  
  const itemFromState = useAppSelector(state => {
    if (!itemId) return null;
    try {
      return selectKanbanItemById(state, itemId) || null;
    } catch {
      return null;
    }
  });

  const item = useMemo(() => {
    if (!itemId) return null;
    
    if (currentItem?.id === itemId) return currentItem;
    if (itemFromState?.id === itemId) return itemFromState;
    if (initialItem && initialItem.id === itemId) return initialItem;
    
    return null;
  }, [currentItem, itemFromState, itemId, initialItem]);

  const isLoading = itemId !== null && item === null;

  return { item, isLoading };
}
