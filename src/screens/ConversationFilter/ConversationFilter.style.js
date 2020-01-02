import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    marginVertical: 8,
    color: theme['header-text-color'],
    fontFamily: theme['font-family-semi-bold'],
    fontSize: theme['font-size-large'],
    fontWeight: theme['font-semi-bold'],
  },
  itemMainView: {
    borderBottomWidth: 1,
    borderBottomColor: theme['color-border-light'],
    marginTop: 16,
    paddingBottom: 8,
    paddingLeft: 24,
    paddingRight: 24,
  },
  itemHeaderTitle: {
    fontSize: theme['font-size-medium'],
    fontWeight: theme['font-semi-bold'],
    color: theme['color-heading'],
  },
  itemView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: {
    color: theme['text-primary-color'],
    fontFamily: theme['font-regular'],
    fontSize: theme['font-size-medium'],
  },

  filterButtonView: {
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 32,
  },
  filterButton: {
    flex: 1,
  },

  filterButtonText: {
    color: theme['button-color'],
    fontFamily: 'Inter-Medium',
    fontWeight: theme['font-medium'],
    fontSize: theme['button-font-size'],
  },
  text: {
    marginVertical: 8,
  },
  radio: {
    marginVertical: 8,
  },
});

export default styles;
