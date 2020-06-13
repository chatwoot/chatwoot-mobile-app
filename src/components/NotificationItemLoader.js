import React from 'react';
import { View, Dimensions } from 'react-native';
import { withStyles } from '@ui-kitten/components';
import * as Animatable from 'react-native-animatable';
import PropTypes from 'prop-types';

const deviceWidth = Dimensions.get('window').width;

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
  }).isRequired,
};

const NotificationItemLoaderComponent = ({ eva }) => {
  const { style } = eva;
  return (
    <Animatable.View
      animation="flash"
      easing="ease-out"
      iterationCount="infinite"
      duration={3000}
      style={style.container}>
      <View style={style.itemView}>
        <View style={style.avatarView}>
          <View style={style.avatarLoader} />
        </View>
        <View>
          <View style={style.chatLoader} />
        </View>
      </View>
    </Animatable.View>
  );
};
NotificationItemLoaderComponent.propTypes = propTypes;
export default withStyles(NotificationItemLoaderComponent, (theme) => ({
  container: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 0.5,
    backgroundColor: 'white',
  },
  itemView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarView: {
    justifyContent: 'flex-end',
    marginRight: 16,
  },
  avatarLoader: {
    width: 48,
    height: 48,
    borderRadius: 48,
    backgroundColor: theme['color-light-gray'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatLoader: {
    width: deviceWidth * 0.7,
    height: deviceWidth * 0.02,
    backgroundColor: theme['color-light-gray'],
    borderRadius: 8,
  },
}));
