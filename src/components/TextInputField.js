import React from 'react';
import { View, Text } from 'react-native';
import { TextInput, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  textViewError: {
    borderWidth: 1,
    borderColor: '#ed2f2f',
    borderRadius: 4,
    marginTop: 10,
  },
  label: {
    color: '#989898',
    paddingBottom: 6,
    fontSize: 12,
  },
  errorLabel: {
    color: '#ed2f2f',
    textAlign: 'left',
    paddingTop: 2,
    paddingBottom: 2,
    fontSize: 12,
  },
  inputStyle: {
    fontSize: 12,
    color: '#989898',
    paddingTop: 4,
    paddingLeft: 4,
    paddingRight: 4,
    paddingBottom: 4,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#E9E9E9',
    height: 40,
  },
  errorInputStyle: {
    fontSize: 12,
    color: '#989898',
    paddingTop: 4,
    paddingLeft: 4,
    paddingRight: 4,
    paddingBottom: 4,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#ed2f2f',
    height: 40,
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
        placeholderTextColor={
          locals.placeholderTextColor ? locals.placeholderTextColor : '#999999'
        }
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
