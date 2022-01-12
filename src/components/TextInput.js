import React from 'react';
import { View, TextInput } from 'react-native';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import Text from './Text';

const themedStyles = StyleService.create({
  textViewError: {
    borderWidth: 1,
    borderColor: 'color-danger-900',
    borderRadius: 4,
    marginTop: 8,
  },
  label: {
    color: 'text-basic-color',
    paddingBottom: 6,
    fontSize: 'text-primary-size',
    fontWeight: 'font-medium',
  },
  errorLabel: {
    color: 'color-danger-900',
    textAlign: 'left',
    paddingTop: 2,
    paddingBottom: 2,
    fontSize: 'text-primary-size',
  },
  inputStyle: {
    fontSize: 'input-font-size',
    color: 'text-basic-color',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: 'color-basic-focus-border',
    height: 48,
  },
  errorInputStyle: {
    fontSize: 'input-font-size',
    color: 'text-basic-color',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: 'color-danger-900',
    height: 48,
  },
});

const propTypes = {
  onChangeText: PropTypes.func.isRequired,
  error: PropTypes.object,
  keyboardType: PropTypes.string,
  secureTextEntry: PropTypes.bool,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};
const TextInputField = ({ onChangeText, error, keyboardType, secureTextEntry, label, value }) => {
  const styles = useStyleSheet(themedStyles);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={error ? styles.errorInputStyle : styles.inputStyle}
        accessibilityLabel={label}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        onChangeText={onChangeText}
        value={value}
        autoCapitalize="none"
        autoComplete={false}
        autoCorrect={false}
      />
      {error && <Text style={styles.errorLabel}>{error.message}</Text>}
    </View>
  );
};

TextInputField.propTypes = propTypes;

export default TextInputField;
