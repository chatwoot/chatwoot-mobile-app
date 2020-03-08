import { Dimensions } from 'react-native';

const deviceWidth = Dimensions.get('window').width;

export default theme => ({
  keyboardView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  logoView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Dimensions.get('window').height * 0.13,
  },
  logo: {
    width: deviceWidth * 0.819,
    height: deviceWidth * 0.4,
    aspectRatio: 2,
    resizeMode: 'contain',
  },

  formView: {
    paddingLeft: 40,
    paddingRight: 40,
    marginTop: Dimensions.get('window').height * 0.07,
  },

  textStyle: {
    fontSize: theme['text-primary-size'],
    fontWeight: theme['font-medium'],
  },

  loginButtonView: {
    paddingTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loginButton: {
    flex: 1,
  },
  loginButtonText: {
    color: theme['text-control-color'],
    fontWeight: theme['font-medium'],
    fontSize: theme['button-font-size'],
  },

  accountView: {
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  forgotView: {
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
