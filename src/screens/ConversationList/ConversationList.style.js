import { theme } from '../../theme';

const styles = theme => ({
  container: {
    flex: 1,
    // Backgrounds, are registered with `background-basic-color-${LEVEL}` variables
    backgroundColor: theme['background-basic-color-1'],
    // backgroundColor: theme['color-white'],
  },
  headerTitle: {
    fontWeight: theme['font-semi-bold'],
    fontSize: theme['font-size-medium'],
  },
  tabContainer: {
    paddingBottom: 90,
    minHeight: 64,
  },
  loadMoreSpinnerView: {
    alignItems: 'center',
    paddingTop: 16,
    height: '100%',
    backgroundColor: theme['background-basic-color-1'],
  },
  tabView: {
    height: '100%',
  },
  tabViewIndicator: {
    // TODO: Remove comments after reviewing this.
    // Is primary by default and uses `color-primary-default`
    // backgroundColor: theme['color-primary'],
  },
  tabActiveTitle: {
    fontWeight: theme['font-medium'],
    fontSize: theme['font-size-small'],
  },
  tabNotActiveTitle: {
    fontWeight: theme['font-medium'],
    fontSize: theme['font-size-small'],
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  emptyText: {
    fontSize: theme['font-size-medium'],
  },
});

export default styles;
