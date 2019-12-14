import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export default StyleSheet.create({
  mainView: {
    flex: 1,
  },
  logoView: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 104,
  },
  logo: {
    flex: 1,
    width: 315,
    height: 900,
    resizeMode: 'contain',
  },
  contentView: {
    flex: 3,
  },
  formView: {
    paddingLeft: 40,
    paddingRight: 40,
    marginTop: 24,
  },

  textStyle: {
    fontSize: theme['text-primary-size'],
    color: theme['text-primary-color'],
    fontWeight: theme['font-medium'],
  },
  loginButtonView: {
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loginButton: {
    color: 'white',
    flex: 1,
  },

  loginButtonText: {
    color: 'white',
    fontWeight: theme['font-medium'],
    fontSize: theme['text-button-size'],
  },

  accountView: {
    paddingTop: 8,
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
