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

  socialIconWrap: {
    marginRight: 10,
    backgroundColor: theme['color-secondary-100'],
    padding: 4,
    borderRadius: 20,
  },

  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 10,
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

  label: {
    paddingLeft: 8,
    fontSize: theme['font-size-small'],
    color: theme['text-light-color'],
  },
});

export default styles;
