import React from 'react';
import { AITextIcon } from './AITextIcon';

interface AIStatusIconProps {
  isEnabled: boolean;
  size?: number;
  onPress?: () => void;
}

export const AIStatusIcon: React.FC<AIStatusIconProps> = ({ isEnabled, size = 16, onPress }) => {
  return <AITextIcon isEnabled={isEnabled} size={size} onPress={onPress} />;
};