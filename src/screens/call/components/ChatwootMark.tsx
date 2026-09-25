import React from 'react';
import { Image } from 'react-native';

// The Chatwoot logo, small, next to the inbox name
export const ChatwootMark = ({ size = 20 }: { size?: number }) => (
  <Image
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    source={require('@/assets/images/logo.png')}
    style={{ width: size, height: size }}
    resizeMode="contain"
  />
);
