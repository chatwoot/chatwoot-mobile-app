import React from 'react';
import PropTypes from 'prop-types';
import { Pressable, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Text } from 'components';

const styles = StyleSheet.create({
  textLoaderContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
});

const LoaderButton = ({ loading, onPress, text, size, colorScheme, ...customProps }) => {
  const theme = useTheme();
  const { colors, borderRadius } = theme;

  const buttonSize = sizeValue => {
    switch (sizeValue) {
      case 'small':
        return {
          borderRadius: borderRadius.micro,
          height: 30,
          width: 60,
        };
      case 'medium':
        return {
          borderRadius: borderRadius.micro,
          height: 36,
          width: 82,
        };
      case 'large':
        return {
          borderRadius: borderRadius.micro,
          height: 42,
          width: 94,
        };
      case 'expanded':
        return {
          borderRadius: borderRadius.micro,
          height: 42,
          width: '100%',
        };
      case 'expandedLarge':
        return {
          borderRadius: borderRadius.micro,
          height: 48,
          width: '100%',
        };
      default:
        return {
          borderRadius: borderRadius.micro,
          height: 42,
          width: '100%',
        };
    }
  };
  // eslint-disable-next-line no-shadow
  const buttonColor = colorScheme => {
    switch (colorScheme) {
      case 'primary':
        return {
          backgroundColor: colors.primaryColor,
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondaryColor,
        };
      case 'alert':
        return {
          backgroundColor: colors.dangerColor,
        };
      case 'warning':
        return {
          backgroundColor: colors.warningColor,
        };
      case 'success':
        return {
          backgroundColor: colors.successColor,
        };
      default:
        return {
          backgroundColor: colors.primaryColor,
        };
    }
  };
  // eslint-disable-next-line no-shadow
  const buttonTextSize = size => {
    switch (size) {
      case 'small':
        return {
          fontWeight: '600',
          fontSize: 12,
        };
      case 'medium':
        return {
          fontWeight: '600',
          fontSize: 14,
        };
      case 'large':
        return {
          fontSize: 16,
        };
      case 'expanded':
        return {
          fontSize: 16,
        };
      case 'expandedLarge':
        return {
          fontSize: 18,
        };
      default:
        return {
          fontSize: 16,
        };
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          ...buttonSize(size),
          ...buttonColor(colorScheme),
          opacity: pressed ? 0.6 : 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
      buttonSize={size}>
      <View style={styles.textLoaderContainer}>
        {loading ? (
          <View>
            <ActivityIndicator size="small" color={colors.colorWhite} animating={loading} />
          </View>
        ) : (
          <Text
            color={colors.colorWhite}
            style={[
              styles.buttonText,
              {
                ...buttonTextSize(size),
              },
            ]}>
            {text}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

const propTypes = {
  loading: PropTypes.bool,
  text: PropTypes.string.isRequired,
  size: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  colorScheme: PropTypes.string.isRequired,
};

LoaderButton.propTypes = propTypes;
export default LoaderButton;
