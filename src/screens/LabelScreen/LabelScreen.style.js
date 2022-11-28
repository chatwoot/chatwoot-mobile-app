const styles = theme => ({
  container: {
    flex: 1,
    backgroundColor: theme['background-basic-color-1'],
  },
  spinnerView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  emptyList: {
    fontSize: theme['font-size-medium'],
    textAlign: 'center',
    paddingHorizontal: 10,
    marginTop: 28,
  },
});

export default styles;
