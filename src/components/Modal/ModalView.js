import React, { useMemo } from 'react';
import { View, Modal as NativeModal, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { Text, Pressable } from 'components';

const createStyles = theme => {
  const { spacing, borderRadius, colors } = theme;
  return StyleSheet.create({
    modalViewWrap: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,.5)',
    },
    modalView: {
      height: 'auto',
      padding: spacing.small,
      width: Dimensions.get('window').width - 24,
      borderRadius: borderRadius.micro,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    modalText: {
      paddingVertical: spacing.half,
    },
    modalButtonView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    modalButton: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: spacing.smaller,
      backgroundColor: colors.primaryColor,
      paddingVertical: spacing.smaller,
      paddingHorizontal: spacing.half,
    },
  });
};

const propTypes = {
  showModal: PropTypes.bool,
  headerText: PropTypes.string,
  contentText: PropTypes.string,
  buttonText: PropTypes.string,
  onPressClose: PropTypes.func,
};

const defaultProps = {
  headerText: '',
  buttonText: '',
  contentText: '',
};

const ModalView = ({ showModal, headerText, contentText, buttonText, onPressClose }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <NativeModal visible={showModal} animationType="fade" transparent={true}>
      <View style={styles.modalViewWrap}>
        <View style={styles.modalView}>
          <Text md bold color={colors.textDark}>
            {headerText}
          </Text>
          <Text sm color={colors.textDark} style={styles.modalText}>
            {contentText}
          </Text>
          <View style={styles.modalButtonView}>
            <Pressable style={styles.modalButton} onPress={onPressClose}>
              <Text sm color={colors.colorWhite} style={styles.modalButtonText}>
                {buttonText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </NativeModal>
  );
};

ModalView.propTypes = propTypes;
ModalView.defaultProps = defaultProps;
export default ModalView;
