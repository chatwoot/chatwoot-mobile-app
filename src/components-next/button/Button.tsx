import { tailwind } from '@/theme';
import React, { memo } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

export interface ButtonProps {
  title?: string;
  text?: string; // Compatibilidade com código antigo
  onPress?: () => void;
  handlePress?: () => void; // Compatibilidade com código antigo
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  style?: any;
  isDestructive?: boolean; // Compatibilidade com código antigo
}

const variantStyles = {
  primary: {
    container: 'bg-brand-primary active:opacity-80',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-gray-600 active:bg-gray-700',
    text: 'text-white',
  },
  danger: {
    container: 'bg-red-600 active:bg-red-700',
    text: 'text-white',
  },
  outline: {
    container: 'bg-transparent border-2 border-gray-300 active:bg-gray-50',
    text: 'text-gray-950',
  },
};

const sizeStyles = {
  sm: {
    container: 'px-3 py-2',
    text: 'text-sm',
  },
  md: {
    container: 'px-4 py-3',
    text: 'text-base',
  },
  lg: {
    container: 'px-6 py-4',
    text: 'text-lg',
  },
};

export const Button = memo<ButtonProps>(
  ({
    title,
    text,
    onPress,
    handlePress,
    variant = 'primary',
    disabled = false,
    loading = false,
    size = 'md',
    fullWidth = false,
    style,
    isDestructive = false,
  }) => {
    // Compatibilidade: usar title ou text, onPress ou handlePress
    const buttonText = title || text || '';
    const buttonOnPress = onPress || handlePress || (() => {});

    // Se isDestructive, usar variant danger
    const finalVariant = isDestructive ? 'danger' : variant;

    const variantStyle = variantStyles[finalVariant];
    const sizeStyle = sizeStyles[size];

    return (
      <Pressable
        onPress={buttonOnPress}
        disabled={disabled || loading}
        style={[
          tailwind.style('rounded-lg items-center justify-center flex-row'),
          tailwind.style(variantStyle.container),
          tailwind.style(sizeStyle.container),
          fullWidth && tailwind.style('w-full'),
          (disabled || loading) && tailwind.style('opacity-50'),
          style,
        ]}
      >
        {loading && (
          <ActivityIndicator
            size="small"
            color={finalVariant === 'outline' ? '#111827' : '#FFFFFF'}
            style={tailwind.style('mr-2')}
          />
        )}
        <Text
          style={[
            tailwind.style('font-inter-medium-24'),
            tailwind.style(variantStyle.text),
            tailwind.style(sizeStyle.text),
          ]}
        >
          {buttonText}
        </Text>
      </Pressable>
    );
  },
);

Button.displayName = 'Button';
