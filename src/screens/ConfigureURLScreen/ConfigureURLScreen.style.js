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
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
    },
    logoView: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      width: deviceWidth * 0.2,
      height: deviceWidth * 0.7,
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
      marginTop: spacing.small,
    },
    formView: {
      paddingLeft: 40,
      paddingRight: 40,
      marginTop: spacing.smaller,
    },
    nextButtonView: {
      paddingTop: spacing.small,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    nextButton: {
      flex: 1,
    },
  });
};
