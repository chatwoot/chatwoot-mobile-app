import React, { useEffect, useState } from 'react';
import { Image, KeyboardTypeOptions, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import i18n from '@/i18n';
import { tailwind } from '@/theme';

type TemplateMediaInputFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  keyboardType?: KeyboardTypeOptions;
  // Render a live image preview below the input (image headers only).
  withImagePreview?: boolean;
};

const TemplateMediaInputField = ({
  label,
  value,
  placeholder,
  onChangeText,
  isFocused,
  onFocus,
  onBlur,
  keyboardType = 'url',
  withImagePreview = false,
}: TemplateMediaInputFieldProps) => {
  const [errored, setErrored] = useState(false);
  const trimmed = value.trim();
  const showPreview = withImagePreview && trimmed.length > 0;

  useEffect(() => {
    setErrored(false);
  }, [value]);

  return (
    <View style={tailwind.style('mt-6')}>
      <Animated.Text
        style={tailwind.style(
          'mb-3 text-[15px] font-inter-medium-24 tracking-[0.225px] text-gray-500',
        )}>
        {label}
      </Animated.Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={tailwind.color('text-gray-500')}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={keyboardType}
        style={tailwind.style(
          'px-3 py-2 rounded-[10px] border text-base font-inter-420-20 text-gray-950',
          isFocused ? 'border-blue-700' : 'border-blackA-A4',
        )}
      />
      {showPreview && (
        <View
          style={tailwind.style(
            'mt-3 aspect-video rounded-[10px] overflow-hidden bg-gray-50 items-center justify-center',
          )}>
          {errored ? (
            <Animated.Text
              style={tailwind.style(
                'px-4 text-[14px] font-inter-420-20 text-gray-700 text-center',
              )}>
              {i18n.t('CONTENT_TEMPLATE.IMAGE_PREVIEW_FAILED')}
            </Animated.Text>
          ) : (
            <Image
              source={{ uri: trimmed }}
              resizeMode="cover"
              style={tailwind.style('w-full h-full')}
              onError={() => setErrored(true)}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default TemplateMediaInputField;
