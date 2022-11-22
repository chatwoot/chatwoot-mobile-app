import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@react-navigation/native';
import { BottomSheetModalHeader } from 'components';
import {
  BottomSheetModal as BottomSheetModalLibrary,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

const BottomSheetModal = ({
  children,
  headerTitle,
  closeFilter,
  initialSnapPoints,
  bottomSheetModalRef,
  onDismiss,
}) => {
  const theme = useTheme();
  const { colors } = theme;

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        enableTouchThrough={false}
        pressBehavior={'close'}
        opacity={0.6}
        disappearsOnIndex={0} // this should be changed to -1 when the memory leak bug is fixed
        appearsOnIndex={1}
      />
    ),
    [],
  );

  return (
    <BottomSheetModalLibrary
      index={1}
      ref={bottomSheetModalRef}
      onChange={props => {}}
      snapPoints={initialSnapPoints}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.secondaryColor }}
      backdropComponent={renderBackdrop}
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      enablePanDownToClose
      onDismiss={onDismiss}>
      <BottomSheetModalHeader title={headerTitle} closeModal={closeFilter} colors={colors} />
      <BottomSheetScrollView>{children}</BottomSheetScrollView>
    </BottomSheetModalLibrary>
  );
};

BottomSheetModal.propTypes = {
  children: PropTypes.element.isRequired,
  bottomSheetModalRef: PropTypes.object.isRequired,
  onDismiss: PropTypes.func,
  initialSnapPoints: PropTypes.array,
  closeFilter: PropTypes.func,
  headerTitle: PropTypes.string,
};

export default BottomSheetModal;
