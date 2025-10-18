import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
const colors = require('@/theme/colors/light');

interface AITextIconProps {
  isEnabled: boolean;
  size?: number;
  onPress?: () => void;
}

export const AITextIcon: React.FC<AITextIconProps> = ({ isEnabled, size = 16, onPress }) => {
  // Don't render anything when AI is not enabled
  if (!isEnabled) {
    return null;
  }

  const IconComponent = onPress ? TouchableOpacity : View;
  const textSize = Math.max(size * 0.6, 10); // Scale text size relative to container

  return (
    <IconComponent
      style={styles.container}
      onPress={onPress}
      accessible={true}
      accessibilityLabel="AI enabled"
      accessibilityRole={onPress ? 'button' : 'image'}
      activeOpacity={0.7}>
      <Text
        style={[
          styles.text,
          {
            fontSize: textSize,
            color: colors.brand[600], // Always use purple color when visible
          },
        ]}>
        AI
      </Text>
    </IconComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 20,
    minHeight: 20,
  },
  text: {
    fontWeight: 'bold',
    opacity: 0.9,
  },
});
