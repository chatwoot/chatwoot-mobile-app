import { useAppDispatch } from '@/hooks';
import { kanbanActions } from '@/store/kanban/kanbanActions';
import type { KanbanItem } from '@/store/kanban/kanbanTypes';
import { logger } from '@/utils/logger';
import { showToast } from '@/utils/toastUtils';
import { useCallback, useState } from 'react';
import { RELOAD_DELAYS } from '../constants';

interface UseAgentAssignmentOptions {
  item: KanbanItem | null;
  funnelId: number;
  onSuccess?: () => void;
}

interface UseAgentAssignmentResult {
  assignAgent: (agentId: number) => Promise<void>;
  removeAgent: (agentId: number) => Promise<void>;
  isAssigning: number | null;
  isRemoving: number | null;
}



export function useAgentAssignment({
  item,
  funnelId,
  onSuccess,
}: UseAgentAssignmentOptions): UseAgentAssignmentResult {
  const dispatch = useAppDispatch();
  const [isAssigning, setIsAssigning] = useState<number | null>(null);
  const [isRemoving, setIsRemoving] = useState<number | null>(null);

  const assignAgent = useCallback(
    async (agentId: number) => {
      if (!item?.id) return;

      setIsAssigning(agentId);
      try {
        await dispatch(
          kanbanActions.assignAgent({
            itemId: item.id,
            payload: { agent_id: agentId },
          }),
        ).unwrap();

        await new Promise(resolve => setTimeout(resolve, RELOAD_DELAYS.AGENT_OPERATION));

        await dispatch(kanbanActions.getKanbanItem(item.id));
        await dispatch(kanbanActions.getFunnel(funnelId));

        if (onSuccess) onSuccess();

        showToast({ message: 'Agent assigned successfully' });
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || 'Failed to assign agent';
        
        if (error?.response?.status === 422) {
          const wasAssigned = item?.assigned_agents?.some(a => a.id === agentId);
          if (wasAssigned) {
            if (__DEV__) {
              logger.warn('Agent assigned despite 422 error:', errorMessage);
            }
            showToast({ message: 'Agent assigned successfully' });
            return;
          }
        }
        
        logger.error('Error assigning agent:', error);
        showToast({ message: errorMessage });
      } finally {
        setIsAssigning(null);
      }
    },
    [item?.id, funnelId, dispatch, onSuccess],
  );

  const removeAgent = useCallback(
    async (agentId: number) => {
      if (!item?.id) return;

      setIsRemoving(agentId);
      try {
        await dispatch(kanbanActions.removeAgent({ itemId: item.id, agentId })).unwrap();

        await new Promise(resolve => setTimeout(resolve, RELOAD_DELAYS.AGENT_OPERATION));

        await dispatch(kanbanActions.getKanbanItem(item.id));
        await dispatch(kanbanActions.getFunnel(funnelId));

        if (onSuccess) onSuccess();

        showToast({ message: 'Agent removed successfully' });
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || 'Failed to remove agent';
        logger.error('Error removing agent:', error);
        showToast({ message: errorMessage });
      } finally {
        setIsRemoving(null);
      }
    },
    [item?.id, funnelId, dispatch, onSuccess],
  );

  return {
    assignAgent,
    removeAgent,
    isAssigning,
    isRemoving,
  };
}
