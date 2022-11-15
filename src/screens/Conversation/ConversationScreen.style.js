import { StyleSheet } from 'react-native';

export default theme => {
  const { colors } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    filterContainer: {
      paddingHorizontal: 16,
      paddingTop: 2,
      paddingBottom: 18,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 0.4,
      borderBottomColor: colors.border,
    },
  });
};
