import { StyleSheet } from 'react-native';

export default theme => {
  const { spacing, colors } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundChat,
    },
    chatView: {
      flex: 1,
    },
    listContainerStyle: {
      paddingBottom: spacing.half,
      paddingHorizontal: spacing.half,
    },
    loadMoreSpinnerView: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: spacing.smaller,
      paddingTop: spacing.half,
    },
  });
};
