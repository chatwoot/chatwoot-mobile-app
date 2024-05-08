import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@react-navigation/native';
import { BottomSheetModalHeader } from 'components';
import { StyleSheet } from 'react-native';
import {
  BottomSheetModal as BottomSheetModalLibrary,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

const createStyles = theme => {
  const { spacing } = theme;
  return StyleSheet.create({
    handleStyle: {
      paddingBottom: spacing.tiny,
      paddingTop: spacing.smaller,
    },
  });
};

const BottomSheetModal = ({
  children,
  headerTitle,
  closeFilter,
  showHeader,
  bottomSheetModalRef,
  maxContentHeight,
  onDismiss,
  initialSnapPoints,
  autoHeightEnabled = false,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        enableTouchThrough={false}
        pressBehavior={'close'}
        opacity={0.5}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );

  return (
    <BottomSheetModalLibrary
      ref={bottomSheetModalRef}
      {...(autoHeightEnabled && { index: 0 })}
      {...(!autoHeightEnabled && { index: 1 })}
      {...(!autoHeightEnabled && { snapPoints: initialSnapPoints })}
      onChange={props => {}}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.secondaryColorLight }}
      handleStyle={styles.handleStyle}
      topInset={60}
      backdropComponent={renderBackdrop}
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      enableDynamicSizing={autoHeightEnabled}
      {...(autoHeightEnabled && { maxDynamicContentSize: maxContentHeight })}
      enablePanDownToClose
      onDismiss={onDismiss}>
      {showHeader && (
        <BottomSheetModalHeader title={headerTitle} closeModal={closeFilter} colors={colors} />
      )}
      <BottomSheetScrollView>{children}</BottomSheetScrollView>
    </BottomSheetModalLibrary>
  );
};

BottomSheetModal.propTypes = {
  children: PropTypes.element.isRequired,
  bottomSheetModalRef: PropTypes.object.isRequired,
  showHeader: PropTypes.bool,
  onDismiss: PropTypes.func,
  initialSnapPoints: PropTypes.array,
  closeFilter: PropTypes.func,
  headerTitle: PropTypes.string,
  maxContentHeight: PropTypes.number,
  autoHeightEnabled: PropTypes.bool,
};

export default BottomSheetModal;
