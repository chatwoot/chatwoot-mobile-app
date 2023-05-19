import React, { useMemo } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Text } from 'components';

const createStyles = theme => {
  const { colors, fontSize, spacing, borderRadius } = theme;
  return StyleSheet.create({
    textViewError: {
      borderWidth: 1,
      borderColor: colors.dangerColorDark,
      borderRadius: borderRadius.micro,
      marginTop: spacing.smaller,
    },
    label: {
      paddingBottom: 6,
    },
    errorLabel: {
      textAlign: 'left',
      paddingTop: spacing.tiny,
      paddingBottom: spacing.tiny,
    },
    inputStyle: {
      fontSize: fontSize.md,
      color: colors.textDark,
      paddingVertical: spacing.smaller,
      paddingHorizontal: spacing.small,
      borderWidth: 1,
      borderRadius: borderRadius.micro,
      borderColor: colors.borderLight,
      height: spacing.larger,
    },
    errorInputStyle: {
      fontSize: fontSize.md,
      color: colors.textDark,
      paddingVertical: spacing.smaller,
      paddingHorizontal: spacing.small,
      borderWidth: 1,
      borderRadius: borderRadius.micro,
      borderColor: colors.dangerColorDark,
      height: spacing.larger,
    },
  });
};

const propTypes = {
  onChangeText: PropTypes.func.isRequired,
  error: PropTypes.object,
  keyboardType: PropTypes.string,
  secureTextEntry: PropTypes.bool,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};
const TextInputField = ({ onChangeText, error, keyboardType, secureTextEntry, label, value }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <View>
      <Text sm medium color={colors.textDark} style={styles.label}>
        {label}
      </Text>
      <TextInput
        style={error ? styles.errorInputStyle : styles.inputStyle}
        accessibilityLabel={label}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        onChangeText={onChangeText}
        value={value}
        autoCapitalize="none"
      />
      {error && (
        <Text sm color={colors.dangerColor} style={styles.errorLabel}>
          {error.message}
        </Text>
      )}
    </View>
  );
};

TextInputField.propTypes = propTypes;

export default TextInputField;
