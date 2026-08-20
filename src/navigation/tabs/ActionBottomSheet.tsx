import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  resetActionState,
  selectCurrentActionState,
} from '@/store/conversation/conversationActionSlice';

import { Sheet } from '@/components-next/common/sheet/Sheet';
import { useRefsContext } from '@/context';
import {
  UpdateAssignee,
  UpdateStatus,
  UpdateLabels,
  UpdateTeam,
  UpdatePriority,
} from '@/screens/conversations/components/conversation-actions';

const ActionBottomSheet = () => {
  const dispatch = useAppDispatch();
  const currentActionState = useAppSelector(selectCurrentActionState);

  const { actionsModalSheetRef } = useRefsContext();

  const actionHeight = useMemo(() => {
    switch (currentActionState) {
      case 'Assign':
        return 400;
      case 'Status':
        return 250;
      case 'Label':
        return 368;
      case 'Priority':
        return 300;
      case 'TeamAssign':
        return 400;
      default:
        return 250;
    }
  }, [currentActionState]);

  const isScrollable =
    currentActionState === 'Assign' ||
    currentActionState === 'Label' ||
    currentActionState === 'TeamAssign';

  const handleOnDismiss = () => {
    dispatch(resetActionState());
  };

  return (
    <Sheet
      ref={actionsModalSheetRef}
      height={actionHeight}
      scrollable={isScrollable}
      onDismiss={handleOnDismiss}>
      {currentActionState === 'Assign' ? <UpdateAssignee /> : null}
      {currentActionState === 'TeamAssign' ? <UpdateTeam /> : null}
      {currentActionState === 'Status' ? <UpdateStatus /> : null}
      {currentActionState === 'Label' ? <UpdateLabels /> : null}
      {currentActionState === 'Priority' ? <UpdatePriority /> : null}
    </Sheet>
  );
};

export default ActionBottomSheet;
