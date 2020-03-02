import { StyleSheet, Dimensions } from 'react-native';

import { theme } from '../../theme';

export default StyleSheet.create({
  keyboardView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  logoView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Dimensions.get('window').height * 0.2,
  },
  logo: {
    width: Dimensions.get('window').width * 0.819,
    height: 100,
    resizeMode: 'center',
  },

  formView: {
    paddingLeft: 40,
    paddingRight: 40,
    marginTop: Dimensions.get('window').height * 0.07,
  },

  textStyle: {
    fontSize: theme['text-primary-size'],
    fontWeight: theme['font-medium'],
    color: theme['text-primary-color'],
    fontFamily: theme['font-family-medium'],
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
    color: theme['button-color'],
    fontFamily: 'Inter-Medium',
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
  button: {
    backgroundColor: theme['button-color'],
    borderColor: theme['button-color'],
  },
});
