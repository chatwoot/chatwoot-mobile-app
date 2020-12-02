const styles = (theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme['background-basic-color-1'],
  },

  avatarContainer: {
    flexDirection: 'row',
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  userNameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 2,
  },

  descriptionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 16,
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
  emailLabel: {
    paddingTop: 8,
    fontSize: theme['font-size-extra-small'],
    color: theme['color-gray'],
  },
  description: {
    paddingTop: 8,
    fontSize: theme['font-size-extra-small'],
    color: theme['color-gray'],
  },
  itemListView: {
    padding: 16,
  },
});

export default styles;
