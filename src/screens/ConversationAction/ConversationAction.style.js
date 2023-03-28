import { StyleSheet } from 'react-native';

export default theme => {
  const { colors, spacing, borderRadius } = theme;
  return StyleSheet.create({
    squareLayoutWrap: {
      flexDirection: 'row',
      paddingHorizontal: spacing.small,
      width: '100%',
      justifyContent: 'space-between',
      borderBottomWidth: 0.4,
      borderTopWidth: 0.4,
      borderRadius: borderRadius.small,
      borderTopColor: colors.borderLight,
      borderBottomColor: colors.border,
      backgroundColor: colors.backgroundLight,
    },
  });
};
