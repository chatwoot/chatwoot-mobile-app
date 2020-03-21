export default theme => ({
  mainView: {
    flex: 1,
  },
  headerTitle: {
    marginVertical: 8,
    fontSize: theme['font-size-large'],
    fontWeight: theme['font-semi-bold'],
  },
  contentView: {
    marginTop: 50,
    flex: 6,
  },
  formView: {
    paddingLeft: 40,
    paddingRight: 40,
    marginTop: 48,
  },

  textStyle: {
    fontSize: theme['text-primary-size'],
    fontWeight: theme['font-medium'],
  },

  loginButtonView: {
    paddingTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loginButton: {
    flex: 1,
  },
  loginButtonText: {
    color: theme['text-control-color'],
    fontWeight: theme['font-medium'],
    fontSize: theme['font-size-large'],
  },

  accountView: {
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  forgotView: {
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
