import { Dimensions } from 'react-native';

const styles = theme => ({
  mainContainer: {
    flex: 1,
    backgroundColor: theme['background-basic-color-1'],
  },

  container: {
    flex: 1,
    backgroundColor: theme['color-background'],
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: theme['color-background'],
    alignItems: 'center',
  },
  spinnerView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  overflowMenu: {
    padding: 8,
    borderRadius: 8,
    width: Dimensions.get('window').width / 1.5,
  },

  inputView: {
    flex: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme['background-basic-color-1'],
  },
  input: {
    flex: 1,
    fontSize: theme['text-primary-size'],
    color: theme['text-basic-color'],
    margin: 0,
    marginHorizontal: 4,
    paddingTop: 4,
    paddingLeft: 4,
    paddingRight: 4,
    paddingBottom: 4,
    height: 48,
  },
  addMessageButton: {
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  backdrop: {
    backgroundColor: theme['back-drop-color'],
  },
  tabBar: {
    backgroundColor: theme['color-white'],
  },
  tabStyle: {
    width: 'auto',
  },
  tabIndicator: {
    backgroundColor: theme['color-primary-default'],
  },
  tabLabel: {
    textTransform: 'capitalize',
    fontSize: theme['font-size-small'],
  },
});

export default styles;
