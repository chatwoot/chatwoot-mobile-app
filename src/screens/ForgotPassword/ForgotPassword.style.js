import { Dimensions } from 'react-native';
import { StyleSheet } from 'react-native';

const deviceWidth = Dimensions.get('window').width;

export default theme => {
  const { spacing, colors } = theme;
  return StyleSheet.create({
    mainView: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerTitle: {
      marginVertical: spacing.smaller,
    },
    logoView: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Dimensions.get('window').height * 0.03,
    },
    logo: {
      width: deviceWidth * 0.2,
      height: deviceWidth * 0.7,
      aspectRatio: 2,
      resizeMode: 'contain',
    },
    titleView: {
      marginTop: Dimensions.get('window').height * 0.01,
      paddingLeft: 40,
      paddingRight: 40,
    },
    titleText: {
      textAlign: 'center',
    },
    subTitleText: {
      textAlign: 'center',
    },
    formView: {
      paddingLeft: 40,
      paddingRight: 40,
      marginTop: Dimensions.get('window').height * 0.04,
    },
    forgotButtonView: {
      paddingTop: spacing.small,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    forgotButton: {
      width: '100%',
    },
  });
};
