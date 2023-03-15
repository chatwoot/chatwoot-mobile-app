import { StyleSheet, Dimensions } from 'react-native';
const deviceWidth = Dimensions.get('window').width;

export default theme => {
  const { colors, borderRadius, spacing } = theme;

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
      borderWidth: 0.4,
      borderColor: colors.borderLight,
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
      paddingHorizontal: spacing.small,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    },
    aboutImage: {
      width: deviceWidth * 0.8,
      height: deviceWidth * 0.134,
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
    logoutSection: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      paddingVertical: spacing.medium,
    },
    logoutButton: {
      flexDirection: 'row',
      paddingVertical: spacing.smaller,
      paddingHorizontal: spacing.half,
      borderRadius: borderRadius.small,
      borderColor: colors.border,
      borderWidth: 1,
    },
    logoutText: {
      marginLeft: spacing.micro,
    },
  });
};
