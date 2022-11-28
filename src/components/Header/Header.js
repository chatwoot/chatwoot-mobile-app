import React, { useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { Icon, Text, Pressable } from 'components';

const createStyles = theme => {
  const { spacing, colors } = theme;
  return StyleSheet.create({
    headerContainer: {
      paddingHorizontal: spacing.small,
      paddingVertical: spacing.small,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      backgroundColor: colors.background,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerCenter: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerLeftIcon: {
      marginRight: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerLoader: {
      marginLeft: spacing.smaller,
      paddingRight: spacing.smaller,
    },
  });
};

const propTypes = {
  loading: PropTypes.bool,
  headerText: PropTypes.string,
  leftIcon: PropTypes.string,
  rightIcon: PropTypes.string,
  onPressLeft: PropTypes.func,
  onPressRight: PropTypes.func,
};

const defaultProps = {
  loading: false,
  headerText: '',
  leftIcon: '',
  rightIcon: '',
};

const Header = ({ leftIcon, rightIcon, loading, headerText, onPressLeft, onPressRight }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerLeft}>
        {leftIcon ? (
          <Pressable style={styles.headerLeftIcon} onPress={onPressLeft}>
            <Icon icon={leftIcon} color={colors.textDark} size={20} />
          </Pressable>
        ) : null}
        <View style={styles.headerCenter}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={colors.textDark}
              animating={loading}
              style={styles.headerLoader}
            />
          ) : null}
          <Text lg bold color={colors.textDark} style={styles.headerTitle}>
            {headerText}
          </Text>
        </View>
      </View>
      {rightIcon ? (
        <Pressable onPress={onPressRight}>
          <Icon icon={rightIcon} color={colors.textDark} size={20} />
        </Pressable>
      ) : null}
    </View>
  );
};

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;
export default Header;
