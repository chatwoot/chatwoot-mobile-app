import React from 'react';
import { View, Dimensions } from 'react-native';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import * as Animatable from 'react-native-animatable';

const deviceWidth = Dimensions.get('window').width;

const themedStyles = StyleService.create({
  container: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 0.5,
    backgroundColor: 'background-basic-color-1',
    borderColor: 'color-border',
    borderBottomWidth: 1,
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
    backgroundColor: 'color-light-gray',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userNameLoader: {
    width: deviceWidth * 0.2,
    height: deviceWidth * 0.02,
    backgroundColor: 'color-light-gray',
    marginTop: 8,
    borderRadius: 4,
  },
  chatLoader: {
    width: deviceWidth * 0.5,
    height: deviceWidth * 0.02,
    backgroundColor: 'color-light-gray',
    marginTop: 16,
    borderRadius: 8,
  },
  timeStampLoader: {
    width: deviceWidth * 0.08,
    height: deviceWidth * 0.02,
    backgroundColor: 'color-light-gray',
    marginTop: 8,
    borderRadius: 8,
  },
});

const ConversationItemLoader = () => {
  const styles = useStyleSheet(themedStyles);

  return (
    <Animatable.View
      animation="flash"
      easing="ease-out"
      iterationCount="infinite"
      duration={3000}
      style={styles.container}>
      <View style={styles.itemView}>
        <View style={styles.avatarView}>
          <View style={styles.avatarLoader} />
        </View>
        <View>
          <View style={styles.userNameLoader} />
          <View style={styles.chatLoader} />
        </View>
      </View>
      <View>
        <View style={styles.timeStampLoader} />
      </View>
    </Animatable.View>
  );
};

export default ConversationItemLoader;
