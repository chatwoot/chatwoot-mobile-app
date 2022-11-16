import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Text, Icon, Pressable } from 'components';
import PropTypes from 'prop-types';
import { getTextSubstringWithEllipsis } from 'helpers';

const createStyles = theme => {
  const { colors, spacing, borderRadius } = theme;
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.smaller,
      paddingVertical: spacing.micro,
      borderRadius: borderRadius.small,
      backgroundColor: colors.backgroundLight,
      borderWidth: 0.2,
      maxWidth: 100,
      width: 'auto',
      marginRight: spacing.micro,
      borderColor: colors.borderLight,
    },
    dropdownIcon: {
      marginRight: spacing.micro,
    },
    dropdownCountWrapper: {
      backgroundColor: colors.dangerColorLight,
      borderRadius: borderRadius.medium,
      paddingHorizontal: spacing.tiny,
      paddingVertical: spacing.tiny,
      alignItems: 'center',
      width: 20,
    },
  });
};

const propTypes = {
  count: PropTypes.number,
  onSelectItem: PropTypes.func,
};

const Dropdown = ({ onSelectItem, count }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <Pressable style={styles.container} onPress={() => onSelectItem()}>
      <View style={styles.dropdownIcon}>
        <Icon color={colors.textDark} icon="filter-dismiss-outline" size={16} />
      </View>
      <View style={styles.dropdownCountWrapper}>
        <Text xs bold color={colors.dangerColor}>
          {getTextSubstringWithEllipsis(count, 20)}
        </Text>
      </View>
    </Pressable>
  );
};

Dropdown.propTypes = propTypes;
export default Dropdown;
