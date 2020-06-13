const styles = (theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme['background-basic-color-1'],
    // paddingBottom: 120,
  },
  headerTitle: {
    fontWeight: theme['font-semi-bold'],
    fontSize: theme['font-size-large'],
  },
  sectionView: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 16,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
  },
  sectionHeader: {
    fontWeight: theme['font-bold'],
    fontSize: 14,
  },
  title: {
    fontSize: 24,
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  emptyText: {
    fontSize: theme['font-size-medium'],
  },
  loadMoreSpinnerView: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 64,
    height: '100%',
    backgroundColor: theme['background-basic-color-1'],
  },
});

export default styles;
