import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Text, Icon, Pressable } from 'components';
import { getTextSubstringWithEllipsis } from 'helpers';

import PropTypes from 'prop-types';

const propTypes = {
  label: PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.array.isRequired]),
  onPress: PropTypes.func,
  isActive: PropTypes.bool,
  hasLeftIcon: PropTypes.bool,
  leftIconName: PropTypes.string,
};

const createStyles = theme => {
  const { colors, spacing, borderRadius } = theme;
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: colors.borderLight,
      borderWidth: 0.2,
      paddingHorizontal: spacing.smaller,
      paddingVertical: spacing.micro,
      borderRadius: borderRadius.small,
      maxWidth: 240,
      width: 'auto',
      marginRight: spacing.micro,
    },
    icon: {
      marginRight: spacing.micro,
    },
    arrowDownIcon: {
      marginLeft: spacing.micro,
    },
  });
};
const FilterButton = ({ label, onPress, isActive, hasLeftIcon, leftIconName }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <Pressable
      style={[
        {
          backgroundColor: isActive ? colors.primaryColorLight : colors.backgroundLight,
        },
        styles.container,
      ]}
      onPress={onPress}>
      {hasLeftIcon && (
        <View style={styles.icon}>
          <Icon color={colors.textLight} icon={leftIconName} size={14} />
        </View>
      )}
      <Text sm medium color={colors.text}>
        {getTextSubstringWithEllipsis(label, 20)}
      </Text>
      <View style={styles.arrowDownIcon}>
        <Icon color={colors.textLight} icon="arrow-chevron-down-outline" size={16} />
      </View>
    </Pressable>
  );
};

FilterButton.propTypes = propTypes;
export default FilterButton;
