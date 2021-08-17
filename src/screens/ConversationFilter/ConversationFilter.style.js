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

  filterButtonView: {
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  filterButton: {
    flex: 1,
  },

  filterButtonText: {
    fontWeight: theme['font-medium'],
    fontSize: theme['font-size-large'],
  },
  text: {
    marginVertical: 8,
  },
  radio: {
    marginVertical: 8,
  },
});

export default styles;
