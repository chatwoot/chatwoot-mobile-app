import React from 'react';
import { View } from 'react-native';
import { TextInput, StyleSheet } from 'react-native';

import { theme } from '../theme';
import Text from './Text';

const styles = StyleSheet.create({
  textViewError: {
    borderWidth: 1,
    borderColor: theme['color-danger-900'],
    borderRadius: 4,
    marginTop: 8,
  },
  label: {
    color: theme['text-primary-color'],
    paddingBottom: 6,
    fontSize: theme['text-primary-size'],
    fontWeight: theme['font-medium'],
  },
  errorLabel: {
    color: theme['color-danger-900'],
    textAlign: 'left',
    paddingTop: 2,
    paddingBottom: 2,
    fontSize: theme['text-primary-size'],
  },
  inputStyle: {
    fontSize: theme['text-primary-size'],
    color: theme['text-primary-color'],
    paddingTop: 4,
    paddingLeft: 4,
    paddingRight: 4,
    paddingBottom: 4,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: theme['input-border-color'],
    height: 48,
  },
  errorInputStyle: {
    fontSize: theme['text-primary-size'],
    color: theme['text-primary-color'],
    paddingTop: 4,
    paddingLeft: 4,
    paddingRight: 4,
    paddingBottom: 4,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: theme['color-danger-900'],
    height: 48,
  },
});

export default function TextInputField(locals) {
  return (
    <View>
      <Text style={styles.label}>{locals.config.label}</Text>
      <TextInput
        style={locals.hasError ? styles.errorInputStyle : styles.inputStyle}
        accessibilityLabel={locals.label}
        ref={c => {
          this.input = c;
        }}
        autoCapitalize={locals.autoCapitalize}
        autoCorrect={locals.autoCorrect}
        autoFocus={locals.autoFocus}
        blurOnSubmit={locals.blurOnSubmit}
        editable={locals.editable}
        keyboardType={locals.keyboardType}
        maxLength={locals.maxLength}
        multiline={locals.multiline}
        onBlur={locals.onBlur}
        onEndEditing={locals.onEndEditing}
        onFocus={locals.onFocus}
        onLayout={locals.onLayout}
        onSelectionChange={locals.onSelectionChange}
        onSubmitEditing={locals.onSubmitEditing}
        onContentSizeChange={locals.onContentSizeChange}
        placeholderTextColor={theme['text-primary-color']}
        secureTextEntry={locals.secureTextEntry}
        selectTextOnFocus={locals.selectTextOnFocus}
        selectionColor={locals.selectionColor}
        numberOfLines={locals.numberOfLines}
        underlineColorAndroid={locals.underlineColorAndroid}
        clearButtonMode={locals.clearButtonMode}
        clearTextOnFocus={locals.clearTextOnFocus}
        enablesReturnKeyAutomatically={locals.enablesReturnKeyAutomatically}
        keyboardAppearance={locals.keyboardAppearance}
        onKeyPress={locals.onKeyPress}
        returnKeyType={locals.returnKeyType}
        selectionState={locals.selectionState}
        onChangeText={value => locals.onChange(value)}
        onChange={locals.onChangeNative}
        placeholder={locals.placeholder}
        value={locals.value}
      />
      <Text style={styles.errorLabel}>{locals.error}</Text>
    </View>
  );
}
