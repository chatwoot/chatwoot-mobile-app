const styles = theme => ({
  container: {
    flex: 1,
    backgroundColor: theme['color-background'],
  },
  chatView: {
    flex: 13,
  },

  chatContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 8,
  },
  loadMoreSpinnerView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
});

export default styles;
