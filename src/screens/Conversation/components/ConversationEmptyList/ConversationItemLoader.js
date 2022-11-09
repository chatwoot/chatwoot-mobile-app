import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import * as Animatable from 'react-native-animatable';

const isAndroid = Platform.OS === 'android';

const createStyles = theme => {
  const { colors } = theme;
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingLeft: 16,
      paddingRight: 16,
      backgroundColor: colors.background,
    },
    itemView: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarView: {
      alignSelf: 'center',
      marginRight: 10,
    },
    contentView: {
      flex: 1,
      paddingTop: 16,
      paddingBottom: 16,
      borderColor: colors.loaderContentBackground,
      borderBottomWidth: 1,
    },
    avatarLoader: {
      width: 46,
      height: 46,
      borderRadius: 50,
      backgroundColor: colors.loaderContentBackground,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    idInboxNameView: {
      width: 100,
      borderRadius: 4,
      height: 12,
      backgroundColor: colors.loaderContentBackground,
    },
    labelView: {
      marginBottom: isAndroid ? 7.4 : 4,
      flexDirection: 'row',
      alignItems: 'center',
    },
    conversationDetails: {
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    nameView: {
      marginBottom: isAndroid ? 7.4 : 4,
      width: 160,
      borderRadius: 4,
      height: 16,
      backgroundColor: colors.loaderContentBackground,
      flexDirection: 'row',
      alignItems: 'center',
    },
    chatContentView: {
      flexDirection: 'row',
      width: 200,
      borderRadius: 4,
      height: 16,
      backgroundColor: colors.loaderContentBackground,
    },
    unreadTimestampContainer: {
      paddingTop: 34,
      justifyContent: 'flex-end',
      flexDirection: 'column',
      position: 'absolute',
      right: 0,
    },
    timestampView: {
      width: 60,
      height: 10,
      borderRadius: 4,
      backgroundColor: colors.loaderContentBackground,
    },
    badgeView: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      paddingTop: 10,
    },
    badge: {
      width: 16,
      height: 16,
      borderRadius: 16,
      backgroundColor: colors.loaderContentBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};

const propTypes = {
  unReadCount: PropTypes.number,
  content: PropTypes.string,
  messageType: PropTypes.number,
  isPrivate: PropTypes.bool,
};

const ConversationItemLoader = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
        <View style={styles.contentView}>
          <View style={styles.labelView}>
            <View style={styles.idInboxNameView} />
          </View>
          <View style={styles.conversationDetails}>
            <View style={styles.nameView} />
            <View style={styles.chatContentView} />
          </View>
          <View style={styles.unreadTimestampContainer}>
            <View style={styles.timestampView} />
            <View style={styles.badgeView}>
              <View style={styles.badge} />
            </View>
          </View>
        </View>
      </View>
      <View>
        <View style={styles.timeStampLoader} />
      </View>
    </Animatable.View>
  );
};

ConversationItemLoader.propTypes = propTypes;
export default ConversationItemLoader;
