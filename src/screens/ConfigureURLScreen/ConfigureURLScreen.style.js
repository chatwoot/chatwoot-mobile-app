import { Dimensions } from 'react-native';

const deviceWidth = Dimensions.get('window').width;

export default theme => ({
  keyboardView: {
    flex: 1,
    backgroundColor: theme['background-basic-color-1'],
  },
  scrollView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  logoView: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: deviceWidth * 0.2,
    height: deviceWidth * 0.7,
    aspectRatio: 2,
    resizeMode: 'contain',
  },
  titleView: {
    paddingLeft: 40,
    paddingRight: 40,
  },
  titleText: {
    fontSize: theme['font-size-medium'],
    fontWeight: theme['font-medium'],
    textAlign: 'center',
  },
  subTitleText: {
    textAlign: 'center',
    fontSize: theme['font-size-small'],
    lineHeight: 20,
    marginTop: 16,
  },
  formView: {
    paddingLeft: 40,
    paddingRight: 40,
    marginTop: 8,
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
