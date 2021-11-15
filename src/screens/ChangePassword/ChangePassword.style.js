const styles = theme => ({
  container: {
    flex: 1,
    backgroundColor: theme['background-basic-color-1'],
  },
  formView: {
    paddingLeft: 40,
    paddingRight: 40,
    marginTop: 24,
  },
  loginButtonView: {
    marginTop: 24,
    paddingTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButton: {
    flex: 1,
  },
});

export default styles;
