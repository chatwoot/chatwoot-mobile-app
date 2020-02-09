import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eff2f7',
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
  chatContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  inputContainer: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme['color-white'],
  },
  input: {
    flex: 1,
    marginHorizontal: 4,
  },
  addMessageButton: {
    width: 24,
    height: 24,
    borderRadius: 24,
  },
});

export default styles;
