import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { BottomSheetHeader, Icon, SearchBar } from '@/components-next';
import { useRefsContext } from '@/context';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { conversationActions } from '@/store/conversation/conversationActions';
import { setCurrentState } from '@/store/conversation/conversationHeaderSlice';
import {
  selectSelectedConversation,
  selectSelectedIds,
} from '@/store/conversation/conversationSelectedSlice';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import { TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { logger } from '@/utils/logger';
import { showToast } from '@/utils/toastUtils';

type InboxCellProps = {
  inbox: { id: number; name: string; phoneNumber?: string };
  lastItem: boolean;
  currentInboxId: number | undefined;
  onPress: () => void;
};

const InboxCell = (props: InboxCellProps) => {
  const { inbox, lastItem, currentInboxId } = props;
  const isCurrentInbox = currentInboxId === inbox.id;

  return (
    <Pressable
      onPress={props.onPress}
      disabled={isCurrentInbox}
      style={tailwind.style(
        `flex flex-row items-center ${isCurrentInbox ? 'opacity-50' : ''}`,
      )}>
      <Animated.View
        style={tailwind.style(
          'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
          !lastItem ? 'border-b-[1px] border-blackA-A3' : '',
        )}>
        <View style={tailwind.style('flex-1')}>
          <Animated.Text
            style={tailwind.style(
              'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px]',
            )}>
            {inbox.name}
          </Animated.Text>
          {inbox.phoneNumber && (
            <Animated.Text
              style={tailwind.style('text-sm text-gray-500 mt-1 font-inter-normal-20')}>
              {inbox.phoneNumber}
            </Animated.Text>
          )}
        </View>
        {isCurrentInbox && <Icon icon={<TickIcon />} size={20} />}
      </Animated.View>
    </Pressable>
  );
};

export const MoveToInbox = () => {
  const dispatch = useAppDispatch();
  const { actionsModalSheetRef } = useRefsContext();
  const [searchTerm, setSearchTerm] = useState('');

  const inboxes = useAppSelector(selectAllInboxes);
  const selectedIds = useAppSelector(selectSelectedIds);
  const selectedConversation = useAppSelector(selectSelectedConversation);

  const isMultipleConversationsSelected = selectedIds.length > 0;
  const currentInboxId = selectedConversation?.inboxId;

  const filteredInboxes = useMemo(() => {
    if (!searchTerm.trim()) {
      return inboxes || [];
    }
    const term = searchTerm.toLowerCase();
    return (inboxes || []).filter(
      inbox =>
        inbox.name?.toLowerCase().includes(term) ||
        inbox.phoneNumber?.toLowerCase().includes(term),
    );
  }, [inboxes, searchTerm]);


  const handleFocus = useCallback(() => {
    actionsModalSheetRef.current?.expand();
  }, [actionsModalSheetRef]);

  const handleBlur = useCallback(() => {
    // actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
  }, []);

  const handleInboxPress = useCallback(
    async (inboxId: number) => {
      if (currentInboxId === inboxId) {
        showToast({ message: 'A conversa já está nesta caixa de entrada' });
        return;
      }

      try {
        if (isMultipleConversationsSelected) {
          await dispatch(
            conversationActions.bulkMoveConversationsToInbox({
              conversationIds: selectedIds,
              inboxId,
            }),
          ).unwrap();
          showToast({
            message: `${selectedIds.length} conversa(s) movida(s) com sucesso`,
          });
        } else {
          if (!selectedConversation?.id) return;
          await dispatch(
            conversationActions.moveConversationToInbox({
              conversationId: selectedConversation.id,
              inboxId,
            }),
          ).unwrap();
          showToast({ message: 'Conversa movida com sucesso' });
        }

        actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
        dispatch(setCurrentState('none'));
      } catch (error) {
        logger.error('Error moving conversation to inbox:', error);
        const errorMessage =
          (error as { message?: string })?.message ||
          (error as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors?.[0] ||
          'Erro ao mover conversa';
        showToast({ message: errorMessage });
      }
    },
    [
      dispatch,
      selectedConversation,
      selectedIds,
      isMultipleConversationsSelected,
      currentInboxId,
      actionsModalSheetRef,
    ],
  );

  return (
    <View style={tailwind.style('flex-1')}>
      <BottomSheetHeader
        headerText={
          isMultipleConversationsSelected
            ? `Mover ${selectedIds.length} conversa(s)`
            : 'Mover para caixa de entrada'
        }
      />
      <SearchBar
        isInsideBottomSheet
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChangeText={setSearchTerm}
        placeholder="Buscar caixa de entrada..."
      />
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        style={tailwind.style('my-1 pl-3')}>
        {filteredInboxes.length === 0 ? (
          <View style={tailwind.style('px-4 py-8 items-center')}>
            <Text style={tailwind.style('text-sm text-gray-500')}>
              Nenhuma caixa de entrada encontrada
            </Text>
          </View>
        ) : (
          filteredInboxes.map((inbox, index) => (
            <InboxCell
              key={inbox.id}
              inbox={inbox}
              lastItem={index === filteredInboxes.length - 1}
              currentInboxId={currentInboxId}
              onPress={() => handleInboxPress(inbox.id)}
            />
          ))
        )}
      </BottomSheetScrollView>
    </View>
  );
};

