import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  headerTitle: {
    color: theme['header-text-color'],
    fontFamily: theme['font-family-semi-bold'],
    fontSize: theme['font-size-large'],
  },
  subHeaderTitle: {
    color: theme['header-text-color'],
    fontFamily: theme['font-family-regular'],
    fontSize: theme['font-size-extra-small'],
  },

  container: {
    flex: 1,
    backgroundColor: theme['color-background'],
  },
  chatView: {
    flex: 13,
  },
  chatContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 8,
  },
  loadMoreSpinnerView: {
    backgroundColor: theme['color-background-light'],
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  spinnerView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputView: {
    flex: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme['color-white'],
  },
  input: {
    flex: 1,
    fontSize: theme['text-primary-size'],
    color: theme['text-primary-color'],
    margin: 0,
    marginHorizontal: 4,
    paddingTop: 4,
    paddingLeft: 4,
    paddingRight: 4,
    paddingBottom: 4,
    height: 48,
  },
  addMessageButton: {
    width: 12,
    height: 12,
    borderRadius: 12,
  },
});

export default styles;
