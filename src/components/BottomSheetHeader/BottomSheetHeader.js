import React, { useMemo } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '@react-navigation/native';
import Icon from 'src/components/Icon/Icon';
import Text from 'components/Text/Text';
import Pressable from 'components/Pressable/Pressable';

import { StyleSheet } from 'react-native';

const createStyles = theme => {
  const { spacing, colors, borderRadius } = theme;
  return StyleSheet.create({
    headerContainer: {
      paddingTop: spacing.tiny,
      paddingBottom: spacing.tiny,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    headerTitle: {
      textAlign: 'center',
    },
    closeButton: {
      padding: spacing.micro,
      borderRadius: borderRadius.largest,
      borderWidth: 0.5,
    },
  });
};

const propTypes = {
  title: PropTypes.string,
  closeModal: PropTypes.func,
  colors: PropTypes.object,
};

const BottomSheetModalHeader = ({ title, closeModal, colors }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.headerContainer}>
      <Text lg bold color={colors.textDark} style={styles.headerTitle}>
        {title}
      </Text>
      <Pressable
        onPress={closeModal}
        style={[
          {
            backgroundColor: colors.backgroundLight,
            borderColor: colors.borderLight,
          },
          styles.closeButton,
        ]}>
        <Icon icon="dismiss-outline" color={colors.textDark} size={16} />
      </Pressable>
    </View>
  );
};

BottomSheetModalHeader.propTypes = propTypes;
export default BottomSheetModalHeader;
