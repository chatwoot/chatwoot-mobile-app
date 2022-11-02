import React, { useMemo } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '@react-navigation/native';
import Icon from 'src/components/Icon/Icon';
import Text from '../../components/Text/Text';

import { StyleSheet } from 'react-native';

const createStyles = () => {
  return StyleSheet.create({
    headerContainer: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerCenter: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerLoader: {
      marginLeft: 8,
      paddingRight: 8,
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
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.6 : 1,
                marginRight: 16,
                flexDirection: 'row',
                alignItems: 'center',
              },
            ]}
            onPress={onPressLeft}>
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
        <Pressable
          onPress={onPressRight}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.6 : 1,
            },
          ]}>
          <Icon icon={rightIcon} color={colors.textDark} size={20} />
        </Pressable>
      ) : null}
    </View>
  );
};

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;
export default Header;
