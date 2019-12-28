import { StyleSheet, Dimensions } from 'react-native';

const deviceWidth = Dimensions.get('window').width;

import { theme } from '../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerTitle: {
    color: theme['header-text-color'],
    fontFamily: theme['font-family-semi-bold'],
    fontSize: theme['font-size-large'],
  },
  profileContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme['color-border-light'],
  },

  detailsContainer: {
    flex: 1,
    paddingLeft: 16,
    flexDirection: 'column',
    justifyContent: 'center',
  },

  nameLabel: {
    color: theme['color-heading'],
    fontSize: theme['font-size-medium'],
    fontWeight: theme['font-medium'],
  },
  emailLabel: {
    paddingTop: 8,
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-regular'],
    color: theme['text-active-color'],
  },

  itemListView: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme['color-border-light'],
  },

  enabledSection: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: 16,
  },

  sectionText: {
    color: theme['color-body'],
    fontSize: theme['font-size-medium'],
    fontWeight: theme['font-semi-bold'],
  },

  aboutView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  aboutImage: {
    width: deviceWidth * 0.82391,
    height: deviceWidth * 0.171,
    aspectRatio: 2,
    resizeMode: 'contain',
  },
  lastChild: {
    marginBottom: 32,
  },
  appDescriptionView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  appDescriptionText: {
    fontSize: theme['font-size-medium'],
    color: theme['text-primary-color'],
  },
});

export default styles;
