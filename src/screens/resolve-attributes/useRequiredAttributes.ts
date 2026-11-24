import { useCallback } from 'react';
import { StackActions, useNavigation } from '@react-navigation/native';

import { useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import { store } from '@/store';
import { selectRequiredConversationAttributes } from '@/store/account/accountSlice';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import type { Conversation, ConversationStatus } from '@/types';
import { getMissingRequiredAttributes } from '@/utils/attributeUtils';
import { showToast } from '@/utils/toastUtils';

export type ResolveAttributesParams = {
  conversationId: number;
  macroId?: number;
};

export const useRequiredAttributes = () => {
  const navigation = useNavigation();
  const requiredAttributes = useAppSelector(selectRequiredConversationAttributes);

  const hasMissingAttributes = useCallback(
    (conversation?: Conversation) =>
      getMissingRequiredAttributes(requiredAttributes, conversation?.customAttributes || {})
        .length > 0,
    [requiredAttributes],
  );

  const openResolveForm = useCallback(
    (params: ResolveAttributesParams) => {
      navigation.dispatch(StackActions.push('ResolveAttributes', params));
    },
    [navigation],
  );

  // Bulk resolve skips conversations with missing attributes instead of opening the form.
  const getBulkStatusIds = useCallback(
    (status: ConversationStatus, ids: number[]) => {
      if (status !== 'resolved') return ids;
      const state = store.getState();
      const resolvableIds = ids.filter(
        id => !hasMissingAttributes(selectConversationById(state, id)),
      );
      if (resolvableIds.length === 0) {
        showToast({ message: i18n.t('CONVERSATION.REQUIRED_ATTRIBUTES.BULK.ALL_MISSING') });
      } else if (resolvableIds.length < ids.length) {
        showToast({ message: i18n.t('CONVERSATION.REQUIRED_ATTRIBUTES.BULK.PARTIAL_SUCCESS') });
      }
      return resolvableIds;
    },
    [hasMissingAttributes],
  );

  return { hasMissingAttributes, openResolveForm, getBulkStatusIds };
};
