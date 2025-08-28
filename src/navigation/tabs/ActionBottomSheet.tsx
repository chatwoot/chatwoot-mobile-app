import React, { useMemo } from 'react';
import { BottomSheetModal, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import tailwind from 'twrnc';
import { BottomSheetBackdrop } from '@/components-next';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  resetActionState,
  selectCurrentActionState,
} from '@/store/conversation/conversationActionSlice';

import { useRefsContext, useTheme } from '@/context';
import { useThemedStyles } from '@/hooks';
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
  const { isDark } = useTheme();
  const themedTailwind = useThemedStyles();

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const { actionsModalSheetRef } = useRefsContext();

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
      handleIndicatorStyle={tailwind.style('overflow-hidden w-8 h-1 rounded-[11px]')}
      handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
      style={tailwind.style('rounded-[26px] overflow-hidden')}
      backgroundStyle={themedTailwind.style('bg-black')}
      animationConfigs={animationConfigs}
      enablePanDownToClose
      snapPoints={actionSnapPoints}
      onDismiss={handleOnDismiss}
    >
      {currentActionState === 'Assign' ? <UpdateAssignee /> : null}
      {currentActionState === 'TeamAssign' ? <UpdateTeam /> : null}
      {currentActionState === 'Status' ? <UpdateStatus /> : null}
      {currentActionState === 'Label' ? <UpdateLabels /> : null}
      {currentActionState === 'Priority' ? <UpdatePriority /> : null}
    </BottomSheetModal>
  );
};

export default ActionBottomSheet;
