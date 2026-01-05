import { tailwind } from '@/theme';
import React from 'react';
import { Pressable, Switch, Text, View } from 'react-native';

interface RelationshipsTabProps {
  linkContact: boolean;
  setLinkContact: (value: boolean) => void;
  selectedContactId: number | null;
  selectedContactName: string | null;
  onChangeContact: () => void;
  useContactNameAsTitle: boolean;
  setUseContactNameAsTitle: (value: boolean) => void;
}

export const RelationshipsTab: React.FC<RelationshipsTabProps> = ({
  linkContact,
  setLinkContact,
  selectedContactId,
  selectedContactName,
  onChangeContact,
  useContactNameAsTitle,
  setUseContactNameAsTitle,
}) => {
  return (
    <View style={tailwind.style('flex-1 px-4 pt-4')}>
      <View style={tailwind.style('flex-row items-center justify-between mb-4')}>
        <View style={tailwind.style('flex-1 mr-4')}>
          <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
            Vincular Contato
          </Text>
          <Text style={tailwind.style('text-sm text-gray-500')}>
            Associa este item a um contato existente
          </Text>
        </View>
        <Switch
          value={linkContact}
          onValueChange={setLinkContact}
          trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
          thumbColor={linkContact ? '#3B82F6' : '#F3F4F6'}
        />
      </View>

      {linkContact && (
        <View style={tailwind.style('bg-gray-50 p-4 rounded-lg border border-gray-200')}>
          <Text style={tailwind.style('text-sm text-gray-500 mb-1')}>Contato</Text>
          <Pressable
            onPress={onChangeContact}
            style={tailwind.style(
              'bg-white border border-gray-300 rounded-lg px-3 py-2 flex-row justify-between items-center mb-4',
            )}>
            <Text
              style={tailwind.style('text-base text-gray-900 flex-1')}
              numberOfLines={1}>
              {selectedContactName || 'Selecione um contato'}
            </Text>
            <Text style={tailwind.style('text-gray-500')}>▼</Text>
          </Pressable>

          {selectedContactId && (
            <View style={tailwind.style('flex-row items-center justify-between')}>
              <Text style={tailwind.style('text-sm text-gray-700 flex-1 mr-2')}>
                Usar nome do contato como título
              </Text>
              <Switch
                value={useContactNameAsTitle}
                onValueChange={setUseContactNameAsTitle}
                trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
                thumbColor={useContactNameAsTitle ? '#3B82F6' : '#F3F4F6'}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};
