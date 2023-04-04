import React, { useMemo } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '@react-navigation/native';
import { Text, Icon, Pressable } from 'components';

import { StyleSheet } from 'react-native';

const createStyles = theme => {
  const { spacing, colors, borderRadius } = theme;
  return StyleSheet.create({
    headerContainer: {
      paddingBottom: spacing.small,
      paddingTop: spacing.smaller,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      borderBottomColor: colors.border,
      borderBottomWidth: 0.4,
    },
    headerTitle: {
      textAlign: 'center',
    },
    actionButton: {
      paddingVertical: spacing.micro,
      paddingHorizontal: spacing.smaller,
      borderRadius: borderRadius.small,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryColorLight,
    },
    actionButtonText: {
      textAlign: 'center',
      marginLeft: spacing.micro,
    },
  });
};

const propTypes = {
  title: PropTypes.string,
  closeModal: PropTypes.func,
  updateButton: PropTypes.func,
  actionButtonText: PropTypes.string,
  actionButtonIcon: PropTypes.string,
  colors: PropTypes.object,
};

const BottomSheetPageHeader = ({
  title,
  actionButtonText,
  actionButtonIcon,
  closeModal,
  updateButton,
  colors,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.headerContainer}>
      <Text md semiBold color={colors.textDark} style={styles.headerTitle}>
        {title}
      </Text>
      {actionButtonText && (
        <Pressable onPress={updateButton} style={styles.actionButton}>
          {actionButtonIcon && (
            <Icon icon={actionButtonIcon} size={16} color={colors.primaryColorDarker} />
          )}
          <Text sm medium color={colors.primaryColorDarker} style={styles.actionButtonText}>
            {actionButtonText}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

BottomSheetPageHeader.propTypes = propTypes;
export default BottomSheetPageHeader;
