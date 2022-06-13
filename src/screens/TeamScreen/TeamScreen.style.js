const styles = theme => ({
  container: {
    flex: 1,
    backgroundColor: theme['background-basic-color-1'],
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
  emptyTeamsLabel: {
    fontSize: theme['font-size-medium'],
    textAlign: 'center',
    paddingHorizontal: 10,
    marginTop: 28,
  },
});

export default styles;
