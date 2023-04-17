import React, { useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { Icon, Text, Pressable } from 'components';

const createStyles = theme => {
  const { spacing, borderRadius, colors } = theme;
  return StyleSheet.create({
    headerContainer: {
      paddingHorizontal: spacing.half,
      paddingVertical: spacing.half,
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
      padding: spacing.micro,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerLeftIcon: {
      marginRight: spacing.small,
      paddingVertical: spacing.micro,
      paddingLeft: spacing.micro,
      paddingRight: spacing.smaller,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerRightIcon: {
      marginLeft: spacing.small,
      paddingVertical: spacing.micro,
      paddingLeft: spacing.smaller,
      paddingRight: spacing.micro,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerLoader: {
      marginLeft: spacing.smaller,
      paddingRight: spacing.smaller,
    },
    headerCountView: {
      marginLeft: spacing.micro,
      paddingVertical: spacing.tiny,
      paddingHorizontal: spacing.micro,
      minWidth: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundLight,
      borderRadius: borderRadius.small,
      borderColor: colors.borderLight,
      borderWidth: 0.16,
    },
    headerCount: {
      textAlign: 'center',
      lineHeight: spacing.small,
    },
  });
};

const propTypes = {
  loading: PropTypes.bool,
  headerText: PropTypes.string,
  showCount: PropTypes.bool,
  count: PropTypes.number,
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

const Header = ({
  leftIcon,
  rightIcon,
  count,
  showCount,
  loading,
  headerText,
  onPressLeft,
  onPressRight,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerLeft}>
        {leftIcon ? (
          <Pressable style={styles.headerLeftIcon} onPress={onPressLeft}>
            <Icon icon={leftIcon} color={colors.textDark} size={24} />
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
          <Text xl bold color={colors.textDark}>
            {headerText}
          </Text>
          {showCount && !loading && count !== 0 && (
            <View style={styles.headerCountView}>
              <Text xs medium color={colors.textDark} style={styles.headerCount}>
                {`(${count})`}
              </Text>
            </View>
          )}
        </View>
      </View>
      {rightIcon ? (
        <Pressable style={styles.headerRightIcon} onPress={onPressRight}>
          <Icon icon={rightIcon} color={colors.textDark} size={24} />
        </Pressable>
      ) : null}
    </View>
  );
};

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;
export default Header;
