const styles = theme => ({
  container: {
    flex: 1,
    backgroundColor: theme['background-basic-color-1'],
  },

  wrapper: {
    paddingHorizontal: 20,
  },

  avatarContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  userNameContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  descriptionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 8,
  },

  description: {
    fontSize: theme['font-size-small'],
    color: theme['text-light-color'],
    lineHeight: 20,
  },

  socialIconsContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },

  separationView: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme['color-border'],
  },

  nameLabel: {
    textTransform: 'capitalize',
    fontWeight: theme['font-semi-bold'],
    fontSize: theme['font-size-large'],
  },
});

export default styles;
