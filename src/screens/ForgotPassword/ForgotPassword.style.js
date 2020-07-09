import { Dimensions } from 'react-native';

const deviceWidth = Dimensions.get('window').width;

export default (theme) => ({
  mainView: {
    flex: 1,
    backgroundColor: theme['background-basic-color-1'],
  },
  headerTitle: {
    marginVertical: 8,
    fontSize: theme['font-size-large'],
    fontWeight: theme['font-semi-bold'],
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
    width: '100%',
    textAlign: 'center',
    fontSize: theme['font-size-large'],
    fontWeight: theme['font-semi-bold'],
  },
  subTitleText: {
    fontSize: theme['font-size-small'],
    textAlign: 'center',
  },

  contentView: {
    flex: 6,
  },
  formView: {
    paddingLeft: 40,
    paddingRight: 40,
    marginTop: Dimensions.get('window').height * 0.04,
  },

  textStyle: {
    fontSize: theme['text-primary-size'],
    fontWeight: theme['font-medium'],
  },

  forgotButtonView: {
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  forgotButton: {
    flex: 1,
  },
  forgotButtonText: {
    color: theme['text-control-color'],
    fontWeight: theme['font-medium'],
    fontSize: theme['font-size-large'],
  },
});
