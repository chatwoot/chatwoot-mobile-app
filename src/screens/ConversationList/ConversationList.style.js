const styles = (theme) => ({
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
    height: '100%',
    backgroundColor: theme['background-basic-color-1'],
  },
  tabView: {
    height: '100%',
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
