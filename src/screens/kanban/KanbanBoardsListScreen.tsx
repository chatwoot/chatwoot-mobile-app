import { Icon, Spinner } from '@/components-next';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { kanbanActions } from '@/store/kanban/kanbanActions';
import {
  selectKanbanError,
  selectKanbanFunnels,
  selectKanbanIsLoading,
} from '@/store/kanban/kanbanSelectors';
import { Overflow } from '@/svg-icons';
import { tailwind } from '@/theme';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditFunnelModal } from './components/EditFunnelModal';

export const KanbanBoardsListScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const funnels = useAppSelector(selectKanbanFunnels);
  const isLoading = useAppSelector(selectKanbanIsLoading);
  const error = useAppSelector(selectKanbanError);
  const accountId = useAppSelector(state => state.auth.user?.account_id);
  const editFunnelModalRef = useRef<BottomSheetModal>(null);
  const [selectedFunnel, setSelectedFunnel] = useState<(typeof funnels)[0] | null>(null);

  useEffect(() => {
    if (accountId) {
      dispatch(kanbanActions.getFunnels());
    }
  }, [dispatch, accountId]);

  const handleRefresh = () => {
    dispatch(kanbanActions.getFunnels());
  };

  const handleFunnelPress = (funnelId: number) => {
    // @ts-expect-error - React Navigation typing issue
    navigation.navigate('KanbanBoard' as never, { funnelId } as never);
  };

  const handleCreateFunnel = () => {
    navigation.navigate('CreateFunnel' as never);
  };

  const handleEditFunnel = (funnelId: number) => {
    const funnel = funnels?.find(f => f.id === funnelId);
    if (funnel) {
      setSelectedFunnel(funnel);
      editFunnelModalRef.current?.present();
    }
  };

  const handleEditFunnelClose = () => {
    setSelectedFunnel(null);
    editFunnelModalRef.current?.dismiss();
  };

  const getStagesCount = (funnel: { stages?: unknown }): number => {
    if (!funnel.stages) return 0;
    if (Array.isArray(funnel.stages)) {
      return funnel.stages.length;
    }
    if (typeof funnel.stages === 'object') {
      return Object.keys(funnel.stages).length;
    }
    return 0;
  };

  if (isLoading && (!funnels || funnels.length === 0)) {
    return (
      <SafeAreaView style={tailwind.style('flex-1 bg-white justify-center items-center')}>
        <Spinner size={32} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tailwind.style('flex-1 bg-gray-50')}>
      <View style={tailwind.style('bg-white px-4 py-3 border-b border-gray-200')}>
        <Text style={tailwind.style('text-2xl font-inter-semibold-20 text-gray-950')}>
          Kanban Boards
        </Text>
      </View>

      {error && (
        <View style={tailwind.style('bg-red-50 px-4 py-3 mx-4 mt-4 rounded-lg')}>
          <Text style={tailwind.style('text-red-600 text-sm')}>{error}</Text>
        </View>
      )}

      <FlatList
        data={funnels || []}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={[
          tailwind.style('p-4'),
          { paddingBottom: Math.max(insets.bottom, 16) + 100 }, // Espaço para os botões flutuantes
        ]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={tailwind.style('items-center justify-center py-12 px-4')}>
            <Text style={tailwind.style('text-gray-500 text-center mb-4')}>
              Nenhum board encontrado
            </Text>
            <Pressable
              onPress={handleCreateFunnel}
              style={tailwind.style('bg-blue-600 px-6 py-3 rounded-lg')}>
              <Text style={tailwind.style('text-white font-inter-medium-24')}>
                Criar Primeiro Board
              </Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleFunnelPress(item.id)}
            style={[
              tailwind.style(
                'bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200 active:bg-gray-50',
              ),
            ]}>
            <View style={tailwind.style('flex-row items-start justify-between mb-2')}>
              <View style={tailwind.style('flex-1 mr-2')}>
                <Text
                  style={tailwind.style('font-inter-semibold-20 text-gray-950 mb-1')}
                  numberOfLines={2}>
                  {item.name}
                </Text>
                {item.description && (
                  <Text style={tailwind.style('text-gray-600 mb-2')} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
              </View>
              <Pressable
                onPress={e => {
                  e.stopPropagation();
                  handleEditFunnel(item.id);
                }}
                style={tailwind.style('p-1 opacity-60')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon size={20} icon={<Overflow stroke="#858585" />} />
              </Pressable>
            </View>
            <View style={tailwind.style('flex-row items-center mt-2')}>
              <Text style={tailwind.style('text-gray-500 text-xs')}>
                {getStagesCount(item)} colunas
              </Text>
            </View>
          </Pressable>
        )}
      />

      {/* Botão flutuante para criar funil */}
      <Pressable
        onPress={handleCreateFunnel}
        style={[
          tailwind.style(
            'absolute right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg',
          ),
          { bottom: Math.max(insets.bottom, 16) + 80 },
        ]}>
        <Text style={tailwind.style('text-white text-2xl font-bold')}>+</Text>
      </Pressable>

      {/* Edit Funnel Modal */}
      <EditFunnelModal
        funnel={selectedFunnel}
        sheetRef={editFunnelModalRef}
        onClose={handleEditFunnelClose}
      />
    </SafeAreaView>
  );
};
