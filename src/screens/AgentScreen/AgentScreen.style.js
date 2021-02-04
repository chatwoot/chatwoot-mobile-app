const styles = (theme) => ({
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
});

export default styles;
