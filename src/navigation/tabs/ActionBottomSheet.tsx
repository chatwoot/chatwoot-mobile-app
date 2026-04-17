import React, { useMemo } from 'react';
import { BottomSheetModal, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import { tailwind } from '@/theme';
import {
  BottomSheetBackdrop,
  BottomSheetWrapper,
  useBottomSheetThemedStyles,
} from '@/components-next';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  resetActionState,
  selectCurrentActionState,
} from '@/store/conversation/conversationActionSlice';

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

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const { actionsModalSheetRef } = useRefsContext();
  const bottomSheetStyles = useBottomSheetThemedStyles();

  const actionSnapPoints = useMemo(() => {
    switch (currentActionState) {
      case 'Assign':
        return ['50%'];
      case 'Status':
        return [250];
      case 'Label':
        return [368];
      case 'Priority':
        return [300];
      case 'TeamAssign':
        return ['50%'];
      default:
        return [250];
    }
  }, [currentActionState]);

  const handleOnDismiss = () => {
    dispatch(resetActionState());
  };

  return (
    <BottomSheetModal
      ref={actionsModalSheetRef}
      backdropComponent={BottomSheetBackdrop}
      backgroundStyle={bottomSheetStyles.backgroundStyle}
      handleIndicatorStyle={bottomSheetStyles.handleIndicatorStyle}
      handleStyle={bottomSheetStyles.handleStyle}
      style={tailwind.style('rounded-[26px] overflow-hidden')}
      animationConfigs={animationConfigs}
      enablePanDownToClose
      snapPoints={actionSnapPoints}
      onDismiss={handleOnDismiss}>
      <BottomSheetWrapper>
        {currentActionState === 'Assign' ? <UpdateAssignee /> : null}
        {currentActionState === 'TeamAssign' ? <UpdateTeam /> : null}
        {currentActionState === 'Status' ? <UpdateStatus /> : null}
        {currentActionState === 'Label' ? <UpdateLabels /> : null}
        {currentActionState === 'Priority' ? <UpdatePriority /> : null}
      </BottomSheetWrapper>
    </BottomSheetModal>
  );
};

export default ActionBottomSheet;
