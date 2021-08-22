const styles = theme => ({
  container: {
    flex: 1,
    backgroundColor: theme['background-basic-color-1'],
  },
  tabContainer: {
    paddingBottom: 120,
    minHeight: 64,
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
});

export default styles;
