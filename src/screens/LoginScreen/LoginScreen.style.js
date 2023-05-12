import { Dimensions } from 'react-native';
import { StyleSheet } from 'react-native';

const deviceWidth = Dimensions.get('window').width;

export default theme => {
  const { spacing, colors } = theme;
  return StyleSheet.create({
    keyboardView: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      alignItems: 'center',
    },
    logoView: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Dimensions.get('window').height * 0.07,
    },
    logo: {
      width: deviceWidth * 0.2,
      height: deviceWidth * 0.5,
      aspectRatio: 2,
      resizeMode: 'contain',
    },
    titleView: {
      paddingLeft: 40,
      paddingRight: 40,
    },
    titleText: {
      textAlign: 'center',
    },
    subTitleText: {
      textAlign: 'center',
      lineHeight: 20,
      marginVertical: spacing.small,
    },
    formView: {
      paddingLeft: 40,
      paddingRight: 40,
      marginTop: spacing.small,
    },
    spacer: {
      paddingTop: spacing.small,
    },
    loginButtonView: {
      paddingTop: spacing.small,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loginButton: {
      width: '100%',
    },
    separator: {
      color: colors.backgroundLight,
    },
    forgotView: {
      paddingTop: spacing.micro,
      alignItems: 'flex-end',
    },
    accountView: {
      paddingTop: spacing.small,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    linksContainer: {
      paddingBottom: 64,
    },
  });
};
