import { StyleSheet } from 'react-native';

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

  forgotView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotPasswordButton: {
    alignItems: 'flex-end',
    flex: 1,
  },
  loginButtonView: {
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  textStyle: {
    fontSize: 12,
    color: '#989898',
  },
  accountText: {
    fontSize: 12,
    color: '#989898',
    fontWeight: '500',
  },
  resetText: {
    fontSize: 12,
    color: '#989898',
    fontWeight: '500',
  },
  accountView: {
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButton: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
    flex: 1,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },

  termsPrivacyView: {
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
