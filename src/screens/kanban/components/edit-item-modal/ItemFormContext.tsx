import type { KanbanItem } from '@/store/kanban/kanbanTypes';
import React, { createContext, ReactNode, useContext } from 'react';
import { UseFormReturn } from 'react-hook-form';

export interface ItemFormValues {
  title: string;
  description: string;
}

interface ItemFormContextData {
  form: UseFormReturn<ItemFormValues>;
  item: KanbanItem | null;
  isLoading: boolean;
  isSaving: boolean;
}

const ItemFormContext = createContext<ItemFormContextData>({} as ItemFormContextData);

interface ItemFormProviderProps {
  children: ReactNode;
  form: UseFormReturn<ItemFormValues>;
  item: KanbanItem | null;
  isLoading: boolean;
  isSaving: boolean;
}

export const ItemFormProvider: React.FC<ItemFormProviderProps> = ({
  children,
  form,
  item,
  isLoading,
  isSaving,
}) => {
  return (
    <ItemFormContext.Provider value={{ form, item, isLoading, isSaving }}>
      {children}
    </ItemFormContext.Provider>
  );
};

export function useItemForm() {
  const context = useContext(ItemFormContext);
  if (!context) {
    throw new Error('useItemForm must be used within an ItemFormProvider');
  }
  return context;
}
