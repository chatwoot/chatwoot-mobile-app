import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    color: theme['header-text-color'],
    fontFamily: theme['font-family-semi-bold'],
    fontSize: theme['font-size-medium'],
  },
  tabContainer: { minHeight: 64 },
  tabView: {
    height: '100%',
  },
  tabViewIndicator: {
    backgroundColor: theme['color-primary'],
  },
  tabActiveTitle: {
    color: theme['color-primary'],
    fontFamily: theme['font-family-medium'],
    fontWeight: theme['font-medium'],
    fontSize: theme['font-size-small'],
  },
  tabNotActiveTitle: {
    color: theme['tab-not-active-color'],
    fontFamily: theme['font-family-medium'],
    fontWeight: theme['font-medium'],
    fontSize: theme['font-size-small'],
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  emptyText: {
    color: theme['text-primary-color'],
    fontSize: theme['font-size-medium'],
  },
});

export default styles;
