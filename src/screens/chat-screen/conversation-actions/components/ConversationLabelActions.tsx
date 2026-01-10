import React from 'react';

import { useChatWindowContext } from '@/context';
import { useAppDispatch } from '@/hooks';
import { conversationActions } from '@/store/conversation/conversationActions';

import { LabelActions } from '@/components-next/label-section';

interface ConversationLabelActionsProps {
  labels: string[];
}

export const ConversationLabelActions = (props: ConversationLabelActionsProps) => {
  const { labels } = props;
  const { conversationId } = useChatWindowContext();
  const dispatch = useAppDispatch();

  const handleLabelsUpdate = (updatedLabels: string[]) => {
    dispatch(
      conversationActions.addOrUpdateConversationLabels({
        conversationId: conversationId,
        labels: updatedLabels,
      }),
    );
  };

  return <LabelActions labels={labels} onLabelsUpdate={handleLabelsUpdate} />;
};
