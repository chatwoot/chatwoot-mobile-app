import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { View, StyleSheet, Platform } from 'react-native';
const isAndroid = Platform.OS === 'android';

const createStyles = theme => {
  const { spacing, colors, borderRadius } = theme;
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingLeft: spacing.small,
      paddingRight: spacing.small,
      backgroundColor: colors.background,
    },
    itemView: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarView: {
      alignSelf: 'center',
      marginRight: spacing.smaller,
    },
    avatarLoader: {
      width: 42,
      height: 42,
      borderRadius: borderRadius.full,
      backgroundColor: colors.backgroundDark,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentView: {
      flex: 1,
      paddingTop: spacing.small,
      paddingBottom: spacing.small,
      borderColor: colors.backgroundDark,
      borderBottomWidth: 1,
    },
    inboxNameView: {
      width: 80,
      borderRadius: borderRadius.micro,
      height: spacing.smaller,
      backgroundColor: colors.backgroundDark,
    },
    labelView: {
      marginBottom: isAndroid ? spacing.small : spacing.micro,
      flexDirection: 'row',
      alignItems: 'center',
    },
    conversationDetails: {
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    nameView: {
      marginBottom: isAndroid ? spacing.smaller : spacing.smaller,
      width: 140,
      borderRadius: borderRadius.micro,
      height: spacing.half,
      backgroundColor: colors.backgroundDark,
      flexDirection: 'row',
      alignItems: 'center',
    },
    chatContentView: {
      flexDirection: 'row',
      width: 200,
      borderRadius: borderRadius.micro,
      height: spacing.small,
      marginTop: spacing.tiny,
      backgroundColor: colors.backgroundDark,
    },
  });
};

const ChatHeaderLoader = () => {
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
          <View style={styles.conversationDetails}>
            <View style={styles.nameView} />
          </View>
          <View style={styles.labelView}>
            <View style={styles.inboxNameView} />
          </View>
        </View>
      </View>
    </Animatable.View>
  );
};

export default ChatHeaderLoader;
