const styles = theme => ({
  container: {
    flex: 1,
    backgroundColor: theme['background-basic-color-1'],
  },
  spinnerView: {
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyList: {
    fontSize: theme['font-size-medium'],
    textAlign: 'center',
    paddingHorizontal: 12,
    marginTop: 28,
  },
});

export default styles;
