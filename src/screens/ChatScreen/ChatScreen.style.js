import { StyleSheet } from 'react-native';

export default theme => {
  const { colors, fontSize } = theme;
  return StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    backdrop: {
      backgroundColor: colors.backdropColor,
    },
    tabBar: {
      backgroundColor: colors.background,
    },
    tabStyle: {
      width: 'auto',
    },
    tabIndicator: {
      backgroundColor: colors.primaryColor,
    },
    tabLabel: {
      textTransform: 'capitalize',
      fontSize: fontSize.sm,
    },
  });
};
