import { StyleSheet, Dimensions } from 'react-native';

const deviceWidth = Dimensions.get('window').width;

export default StyleSheet.create({
  mainView: {
    flex: 1,
  },
  logoView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 104,
  },
  logo: {
    width: deviceWidth * 0.5,
    height: deviceWidth * 0.218,
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
    // backgroundColor: '#38B1BD',
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
