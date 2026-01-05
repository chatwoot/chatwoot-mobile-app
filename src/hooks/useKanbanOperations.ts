import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { kanbanActions } from '@/store/kanban/kanbanActions';
import { selectKanbanError } from '@/store/kanban/kanbanSelectors';
import type {
  CreateFunnelPayload,
  CreateKanbanItemPayload,
  UpdateFunnelPayload,
  UpdateKanbanItemPayload,
} from '@/store/kanban/kanbanTypes';
import { showToast } from '@/utils/toastUtils';

interface UseKanbanOperationsReturn {
  createFunnel: (payload: CreateFunnelPayload) => Promise<boolean>;
  updateFunnel: (funnelId: number, payload: UpdateFunnelPayload) => Promise<boolean>;
  deleteFunnel: (funnelId: number) => Promise<boolean>;
  createItem: (payload: CreateKanbanItemPayload) => Promise<boolean>;
  updateItem: (itemId: number, payload: UpdateKanbanItemPayload) => Promise<boolean>;
  deleteItem: (itemId: number) => Promise<boolean>;
  error: string | null;
}

export function useKanbanOperations(): UseKanbanOperationsReturn {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectKanbanError);

  const createFunnel = useCallback(
    async (payload: CreateFunnelPayload): Promise<boolean> => {
      try {
        await dispatch(kanbanActions.createFunnel(payload)).unwrap();
        showToast({ message: 'Funil criado com sucesso' });
        return true;
      } catch (err) {
        showToast({ message: (err as string) || 'Erro ao criar funil' });
        return false;
      }
    },
    [dispatch],
  );

  const updateFunnel = useCallback(
    async (funnelId: number, payload: UpdateFunnelPayload): Promise<boolean> => {
      try {
        await dispatch(kanbanActions.updateFunnel({ funnelId, payload })).unwrap();
        showToast({ message: 'Funil atualizado com sucesso' });
        return true;
      } catch (err) {
        showToast({ message: (err as string) || 'Erro ao atualizar funil' });
        return false;
      }
    },
    [dispatch],
  );

  const deleteFunnel = useCallback(
    async (funnelId: number): Promise<boolean> => {
      try {
        await dispatch(kanbanActions.deleteFunnel(funnelId)).unwrap();
        showToast({ message: 'Funil deletado com sucesso' });
        return true;
      } catch (err) {
        showToast({ message: (err as string) || 'Erro ao deletar funil' });
        return false;
      }
    },
    [dispatch],
  );

  const createItem = useCallback(
    async (payload: CreateKanbanItemPayload): Promise<boolean> => {
      try {
        await dispatch(kanbanActions.createKanbanItem(payload)).unwrap();
        showToast({ message: 'Item criado com sucesso' });
        return true;
      } catch (err) {
        showToast({ message: (err as string) || 'Erro ao criar item' });
        return false;
      }
    },
    [dispatch],
  );

  const updateItem = useCallback(
    async (itemId: number, payload: UpdateKanbanItemPayload): Promise<boolean> => {
      try {
        await dispatch(kanbanActions.updateKanbanItem({ itemId, payload })).unwrap();
        showToast({ message: 'Item atualizado com sucesso' });
        return true;
      } catch (err) {
        showToast({ message: (err as string) || 'Erro ao atualizar item' });
        return false;
      }
    },
    [dispatch],
  );

  const deleteItem = useCallback(
    async (itemId: number): Promise<boolean> => {
      try {
        await dispatch(kanbanActions.deleteKanbanItem(itemId)).unwrap();
        showToast({ message: 'Item deletado com sucesso' });
        return true;
      } catch (err) {
        showToast({ message: (err as string) || 'Erro ao deletar item' });
        return false;
      }
    },
    [dispatch],
  );

  return {
    createFunnel,
    updateFunnel,
    deleteFunnel,
    createItem,
    updateItem,
    deleteItem,
    error,
  };
}
