import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
const colors = require('@/theme/colors/light');

interface AIHeaderButtonProps {
  isEnabled: boolean;
  onPress: () => void;
}

export const AIHeaderButton: React.FC<AIHeaderButtonProps> = ({ isEnabled, onPress }) => {
  return (
    <Pressable
      style={[
        styles.button,
        {
          backgroundColor: isEnabled ? colors.brand[600] : colors.gray[300],
        },
      ]}
      onPress={onPress}
      accessible={true}
      accessibilityLabel={isEnabled ? 'AI enabled - tap to disable' : 'AI disabled - tap to enable'}
      accessibilityRole="button"
      hitSlop={8}>
      <Text
        style={[
          styles.text,
          {
            color: isEnabled ? '#FFFFFF' : colors.gray[600],
          },
        ]}>
        AI
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
    minHeight: 28,
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
