import { formatCurrency, getItemValue } from '@/screens/kanban/utils/kanbanHelpers';
import { tailwind } from '@/theme';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useItemForm } from './ItemFormContext';

export const DataTab: React.FC = () => {
  const { item } = useItemForm();

  // Calcular valor do item
  const formattedValue = useMemo(() => {
    if (!item) return '-';
    const value = getItemValue(item);
    if (value === null) return '-';
    
    // Default currency se não tiver no item
    const currency = item.item_details?.currency || { symbol: 'R$', locale: 'pt-BR' };
    return formatCurrency(value, currency, true);
  }, [item]);

  if (!item) {
    return (
      <View style={tailwind.style('flex-1 px-4 pt-4 items-center justify-center')}>
        <Text style={tailwind.style('text-gray-500')}>
          Salve o item primeiro para visualizar dados adicionais.
        </Text>
      </View>
    );
  }

  return (
    <View style={tailwind.style('flex-1 px-4 pt-4')}>
      <View style={tailwind.style('bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4')}>
        <Text style={tailwind.style('text-sm font-inter-medium-24 text-gray-500 mb-1')}>
          ID do Item
        </Text>
        <Text style={tailwind.style('text-base text-gray-900 font-inter-semibold-20')}>
          #{item.id}
        </Text>
      </View>

      <View style={tailwind.style('bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4')}>
        <Text style={tailwind.style('text-sm font-inter-medium-24 text-gray-500 mb-1')}>
          Valor Estimado
        </Text>
        <Text style={tailwind.style('text-base text-gray-900 font-inter-semibold-20')}>
          {formattedValue}
        </Text>
      </View>

      <View style={tailwind.style('bg-gray-50 rounded-lg border border-gray-200 p-4')}>
        <Text style={tailwind.style('text-sm font-inter-medium-24 text-gray-500 mb-1')}>
          Criado em
        </Text>
        <Text style={tailwind.style('text-base text-gray-900')}>
          {new Date(item.created_at).toLocaleString('pt-BR')}
        </Text>
        
        {item.updated_at && (
          <>
            <View style={tailwind.style('h-px bg-gray-200 my-3')} />
            <Text style={tailwind.style('text-sm font-inter-medium-24 text-gray-500 mb-1')}>
              Última atualização
            </Text>
            <Text style={tailwind.style('text-base text-gray-900')}>
              {new Date(item.updated_at).toLocaleString('pt-BR')}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};
