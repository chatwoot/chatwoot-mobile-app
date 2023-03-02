import { StyleSheet, Dimensions } from 'react-native';
const deviceWidth = Dimensions.get('window').width;

export default theme => {
  const { colors, spacing } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    itemsContainer: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      marginBottom: spacing.small,
    },
    separator: {
      backgroundColor: colors.backgroundLight,
      width: '100%',
      paddingVertical: spacing.smaller,
      paddingLeft: spacing.small,
    },
    separatorView: {
      width: '100%',
    },
    accordionItemWrapper: {
      flexDirection: 'column',
      paddingVertical: spacing.small,
      width: '100%',
    },
    aboutView: {
      paddingLeft: spacing.small,
      paddingRight: spacing.small,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    },
    aboutImage: {
      width: deviceWidth * 0.8,
      height: deviceWidth * 0.16,
      aspectRatio: 2,
      resizeMode: 'contain',
    },

    appDescriptionView: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    bottomSheet: {
      padding: spacing.small,
    },
  });
};
