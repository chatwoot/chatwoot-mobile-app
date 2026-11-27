import { useTailwind } from '@/theme/useTailwind';
import React from 'react';
import { TextInput, Text, View } from 'react-native';

import { LABEL, VALUE, ROW } from './emailHeadStyles';

type IOSFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  accessory?: React.ReactNode;
};

export const IOSField = ({ label, value, onChange, accessory }: IOSFieldProps) => {
  const tailwind = useTailwind();
  return (
    <View style={tailwind.style(ROW)}>
      <Text style={tailwind.style(LABEL)}>{`${label}:`}</Text>
      <TextInput
        style={tailwind.style('flex-1 py-[11px] pr-2', VALUE)}
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="Emails separated by commas"
        placeholderTextColor={tailwind.color('text-gray-600')}
      />
      {accessory}
    </View>
  );
};
