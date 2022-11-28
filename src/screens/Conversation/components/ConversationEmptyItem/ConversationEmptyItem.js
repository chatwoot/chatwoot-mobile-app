import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import createStyles from './ConversationEmptyItem.style';

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

export default ConversationItemLoader;
