import { Dimensions } from 'react-native';

const deviceWidth = Dimensions.get('window').width;

export default (theme) => ({
  keyboardView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: theme['background-basic-color-1'],
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
    marginTop: Dimensions.get('window').height * 0.03,
    paddingLeft: 40,
    paddingRight: 40,
  },
  titleText: {
    width: '100%',
    textAlign: 'center',
    fontSize: theme['font-size-large'],
    fontWeight: theme['font-medium'],
  },

  formView: {
    paddingLeft: 40,
    paddingRight: 40,
    marginTop: Dimensions.get('window').height * 0.02,
  },

  nextButtonView: {
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextButton: {
    flex: 1,
  },
  nextButtonText: {
    color: theme['text-control-color'],
    fontWeight: theme['font-medium'],
    fontSize: theme['font-size-large'],
  },
});
