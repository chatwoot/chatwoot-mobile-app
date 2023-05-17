import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { View, Dimensions, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';

const deviceWidth = Dimensions.get('window').width;

const createStyles = theme => {
  const { spacing, colors, borderRadius } = theme;
  return StyleSheet.create({
    container: {
      paddingVertical: spacing.half,
      paddingHorizontal: spacing.small,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 0.5,
      backgroundColor: colors.background,
    },
    itemView: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarView: {
      justifyContent: 'flex-end',
      marginRight: spacing.small,
    },
    listView: {
      flexDirection: 'column',
    },
    avatarLoader: {
      width: 48,
      height: 48,
      borderRadius: 48,
      backgroundColor: colors.backgroundDark,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    chatLoader: {
      width: deviceWidth * 0.7,
      height: deviceWidth * 0.04,
      backgroundColor: colors.backgroundDark,
      borderRadius: borderRadius.micro,
    },
    chatTimeLoader: {
      borderRadius: borderRadius.micro,
      marginTop: spacing.smaller,
      backgroundColor: colors.backgroundDark,
      width: deviceWidth * 0.16,
      height: deviceWidth * 0.02,
    },
  });
};

const NotificationItemLoaderComponent = () => {
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
        <View style={styles.listView}>
          <View style={styles.chatLoader} />
          <View style={styles.chatTimeLoader} />
        </View>
      </View>
    </Animatable.View>
  );
};

export default NotificationItemLoaderComponent;
