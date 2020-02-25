import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export default StyleSheet.create({
  mainView: {
    flex: 1,
  },
  headerTitle: {
    marginVertical: 8,
    color: theme['header-text-color'],
    fontFamily: theme['font-family-semi-bold'],
    fontSize: theme['font-size-large'],
    fontWeight: theme['font-semi-bold'],
  },
  contentView: {
    marginTop: 50,
    flex: 6,
  },
  formView: {
    paddingLeft: 40,
    paddingRight: 40,
    marginTop: 48,
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
