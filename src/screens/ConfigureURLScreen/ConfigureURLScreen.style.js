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

  nextButtonView: {
    paddingTop: 64,
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
