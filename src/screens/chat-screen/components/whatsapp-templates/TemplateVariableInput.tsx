import React from 'react';
import { TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';

type TemplateVariableInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
};

const TemplateVariableInput = ({
  label,
  value,
  onChangeText,
  isFocused,
  onFocus,
  onBlur,
}: TemplateVariableInputProps) => (
  <View style={tailwind.style('flex-row items-center mb-4')}>
    <Animated.Text
      style={tailwind.style(
        'w-8 text-[15px] font-inter-medium-24 tracking-[0.225px] text-gray-500',
      )}>
      {label}
    </Animated.Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      onFocus={onFocus}
      onBlur={onBlur}
      autoCapitalize="none"
      autoCorrect={false}
      placeholder={label}
      placeholderTextColor={tailwind.color('text-gray-500')}
      style={tailwind.style(
        'flex-1 px-3 py-2 rounded-[10px] border text-base font-inter-420-20 text-gray-950',
        isFocused ? 'border-blue-700' : 'border-blackA-A4',
      )}
    />
  </View>
);

export default TemplateVariableInput;
