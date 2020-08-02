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
  itemMainView: {
    borderBottomWidth: 1,
    borderBottomColor: theme['color-border'],
    marginTop: 16,
    paddingBottom: 8,
    paddingLeft: 24,
    paddingRight: 24,
  },
  itemHeaderTitle: {
    fontSize: theme['font-size-medium'],
    fontWeight: theme['font-semi-bold'],
  },
  itemView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: theme['font-size-medium'],
  },

  notificationButtonView: {
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 32,
  },
  notificationButton: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },

  notificationButtonText: {
    fontWeight: theme['font-medium'],
    fontSize: theme['font-size-large'],
  },
});

export default styles;
