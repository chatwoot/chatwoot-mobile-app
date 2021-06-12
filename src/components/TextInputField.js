import React from 'react';
import { View, TextInput } from 'react-native';
import { StyleService, useStyleSheet } from '@ui-kitten/components';

import Text from './Text';

const themedStyles = StyleService.create({
  textViewError: {
    borderWidth: 1,
    borderColor: 'color-danger-900',
    borderRadius: 4,
    marginTop: 8,
  },
  label: {
    // For `every text in app`, the reserved variable is text-basic-color
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
    // For `every text in app`, the reserved variable is text-basic-color
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

export default function TextInputField(locals) {
  const styles = useStyleSheet(themedStyles);

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
        // placeholderTextColor={theme['text-primary-color']}
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
