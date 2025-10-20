/**
 * Example Component
 * 
 * This component demonstrates how to use the unified theme system
 * with theme-aware styling that matches the web application.
 */

import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from './useTheme';

// Example chat message component using unified theme
export const ExampleMessageBubble: React.FC<{
  isOutgoing: boolean;
  message: string;
  timestamp: string;
}> = ({ isOutgoing, message, timestamp }) => {
  const { tailwind } = useTheme();
  
  return (
    <View style={tailwind(
      'px-4 py-3 rounded-lg max-w-[80%] mb-2',
      isOutgoing 
        ? 'bg-primary ml-auto' 
        : 'bg-surface border border-border'
    )}>
      <Text style={tailwind(
        'text-sm',
        isOutgoing ? 'text-white' : 'text-foreground'
      )}>
        {message}
      </Text>
      <Text style={tailwind(
        'text-xs mt-1',
        isOutgoing ? 'text-white/70' : 'text-muted'
      )}>
        {timestamp}
      </Text>
    </View>
  );
};

// Example button component using unified theme
export const ExampleButton: React.FC<{
  title: string;
  variant?: 'primary' | 'secondary' | 'destructive';
  onPress: () => void;
}> = ({ title, variant = 'primary', onPress }) => {
  const { tailwind } = useTheme();
  
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary';
      case 'secondary':
        return 'bg-surface border border-border';
      case 'destructive':
        return 'bg-destructive';
      default:
        return 'bg-primary';
    }
  };
  
  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
        return 'text-white';
      case 'secondary':
        return 'text-foreground';
      case 'destructive':
        return 'text-white';
      default:
        return 'text-white';
    }
  };
  
  return (
    <TouchableOpacity
      style={tailwind(
        'px-4 py-3 rounded-lg items-center',
        getButtonStyles()
      )}
      onPress={onPress}
    >
      <Text style={tailwind('text-sm font-medium', getTextStyles())}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// Example card component using unified theme
export const ExampleCard: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => {
  const { tailwind } = useTheme();
  
  return (
    <View style={tailwind('bg-surface border border-border rounded-lg p-4 mb-4')}>
      <Text style={tailwind('text-lg font-semibold text-foreground mb-1')}>
        {title}
      </Text>
      {subtitle && (
        <Text style={tailwind('text-sm text-muted mb-3')}>
          {subtitle}
        </Text>
      )}
      {children}
    </View>
  );
};

// Example input component using unified theme
export const ExampleInput: React.FC<{
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}> = ({ placeholder, value, onChangeText, error }) => {
  const { tailwind } = useTheme();
  
  return (
    <View style={tailwind('mb-4')}>
      <View style={tailwind(
        'bg-input border rounded-lg px-3 py-2',
        error ? 'border-destructive' : 'border-input-border'
      )}>
        <TextInput
          style={tailwind('text-foreground text-base')}
          placeholder={placeholder}
          placeholderTextColor={tailwind('text-muted').color}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
      {error && (
        <Text style={tailwind('text-destructive text-sm mt-1')}>
          {error}
        </Text>
      )}
    </View>
  );
};

// Example status indicator using unified theme
export const ExampleStatusIndicator: React.FC<{
  status: 'online' | 'offline' | 'away' | 'busy';
  label: string;
}> = ({ status, label }) => {
  const { tailwind } = useTheme();
  
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-success';
      case 'offline':
        return 'bg-muted';
      case 'away':
        return 'bg-warning';
      case 'busy':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };
  
  return (
    <View style={tailwind('flex-row items-center')}>
      <View style={tailwind(
        'w-3 h-3 rounded-full mr-2',
        getStatusColor()
      )} />
      <Text style={tailwind('text-sm text-foreground')}>
        {label}
      </Text>
    </View>
  );
};
