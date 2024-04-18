import { StyleSheet } from 'react-native';

export default theme => {
  const { spacing, colors } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundChat,
      position: 'relative',
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
    slaContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
    },
  });
};
