const styles = theme => ({
  container: {
    flex: 1,
    backgroundColor: theme['background-basic-color-1'],
  },
  headerTitle: {
    marginVertical: 8,
    fontSize: theme['font-size-large'],
    fontWeight: theme['font-semi-bold'],
  },
  submitButtonView: {
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  submitButtonText: {
    fontWeight: theme['font-medium'],
    fontSize: theme['font-size-large'],
  },
  spinnerView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
});

export default styles;
