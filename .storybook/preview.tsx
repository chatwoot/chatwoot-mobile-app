import React from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { RefsProvider } from '../src/context/RefsContext';

/** @type{import("@storybook/react").Preview} */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },

  decorators: [
    (Story, { parameters }) => (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <RefsProvider>
            <View
              style={{
                flex: 1,
              }}>
              <Story />
            </View>
          </RefsProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    ),
  ],
};

export default preview;
