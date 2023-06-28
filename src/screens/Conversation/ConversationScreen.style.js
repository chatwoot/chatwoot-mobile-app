import { StyleSheet } from 'react-native';

export default theme => {
  const { colors, spacing } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    filterContainer: {
      paddingBottom: spacing.small,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 0.4,
      borderBottomColor: colors.border,
    },
    filterScrollView: {
      paddingHorizontal: spacing.small,
    },
  });
};
