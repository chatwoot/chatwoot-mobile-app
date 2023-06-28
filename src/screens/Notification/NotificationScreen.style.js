import { StyleSheet } from 'react-native';

export default theme => {
  const { colors, spacing } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadMoreSpinnerView: {
      alignItems: 'center',
      paddingTop: spacing.small,
      paddingBottom: spacing.larger,
      height: '100%',
      backgroundColor: colors.background,
    },
    bottomSheetView: {
      flex: 1,
      paddingHorizontal: spacing.small,
    },
  });
};
