import type { KanbanItem } from '@/store/kanban/kanbanTypes';
import { useEffect } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';

interface ItemForm {
  title: string;
  description: string;
}

interface UseKanbanItemFormOptions {
  item: KanbanItem | null;
  itemId: number | null;
}

interface UseKanbanItemFormResult {
  form: UseFormReturn<ItemForm>;
  setValue: (field: keyof ItemForm, value: string) => void;
}

export function useKanbanItemForm({ item, itemId }: UseKanbanItemFormOptions): UseKanbanItemFormResult {
  const form = useForm<ItemForm>({
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const { reset, setValue } = form;

  useEffect(() => {
    if (!itemId || !item || item.id !== itemId) return;

    const itemTitle = item.item_details?.title || item.title || '';
    const itemDescription = item.item_details?.description || item.description || '';

    reset({
      title: itemTitle,
      description: itemDescription,
    });
  }, [item, itemId, reset]);

  return {
    form,
    setValue,
  };
}
