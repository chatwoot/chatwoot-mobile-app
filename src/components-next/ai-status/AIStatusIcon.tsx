import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '@/theme/colors/light';

interface AIStatusIconProps {
  isEnabled: boolean;
  size?: number;
  onPress?: () => void;
}

export const AIStatusIcon: React.FC<AIStatusIconProps> = ({ isEnabled, size = 16, onPress }) => {
  const IconComponent = onPress ? TouchableOpacity : View;

  return (
    <IconComponent
      style={styles.container}
      onPress={onPress}
      accessible={true}
      accessibilityLabel={isEnabled ? 'AI bot enabled' : 'AI bot disabled'}
      accessibilityRole={onPress ? 'button' : 'image'}>
      <MaterialIcons
        name="smart-toy" // Using smart-toy icon for both states, color indicates enabled/disabled
        size={size}
        color={isEnabled ? colors.brand[600] : colors.gray[600]} // Primary brand purple for enabled, gray for disabled
        style={styles.icon}
      />
    </IconComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 4,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    opacity: 0.9,
  },
});
