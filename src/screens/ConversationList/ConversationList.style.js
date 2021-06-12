const styles = theme => ({
  container: {
    flex: 1,
    backgroundColor: theme['background-basic-color-1'],
  },
  headerTitle: {
    fontWeight: theme['font-semi-bold'],
    fontSize: theme['font-size-medium'],
  },
  tabContainer: {
    paddingBottom: 120,
    minHeight: 64,
  },
  loadMoreSpinnerView: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    height: '100%',
    backgroundColor: theme['background-basic-color-1'],
  },
  tabView: {
    height: '100%',
  },
  tabActiveTitle: {
    fontWeight: theme['font-regular'],
    fontSize: theme['font-size-small'],
  },
  tabNotActiveTitle: {
    fontWeight: theme['font-regular'],
    fontSize: theme['font-size-small'],
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  emptyText: {
    fontSize: theme['font-size-small'],
  },
});

export default styles;
