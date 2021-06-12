import { Dimensions } from 'react-native';

const deviceWidth = Dimensions.get('window').width;

export default theme => ({
  keyboardView: {
    flex: 1,
    backgroundColor: theme['background-basic-color-1'],
  },
  scrollView: {
    flex: 1,
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
    width: '100%',
    textAlign: 'center',
    fontSize: theme['font-size-large'],
    fontWeight: theme['font-medium'],
  },
  subTitleText: {
    textAlign: 'center',
    fontSize: theme['font-size-small'],
    lineHeight: 20,
    marginVertical: 16,
  },
  formView: {
    paddingLeft: 40,
    paddingRight: 40,
    marginTop: 16,
  },
  loginButtonView: {
    paddingTop: 16,
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
    fontSize: theme['font-size-large'],
  },
  separator: {
    color: theme['text-hint-color'],
  },
  forgotView: {
    flex: 1,
    alignItems: 'flex-end',
  },
  accountView: {
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linksContainer: {
    paddingBottom: 64,
  },
  textStyle: {
    fontSize: theme['font-size-extra-small'],
    color: theme['text-hint-color'],
    fontWeight: theme['font-medium'],
  },
});
