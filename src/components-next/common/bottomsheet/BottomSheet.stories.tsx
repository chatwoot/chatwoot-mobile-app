import React from 'react';
import { View } from 'react-native';
import type { Meta } from '@storybook/react';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';

import { BottomSheetHeader } from './BottomSheetHeader';
import { BottomSheetBackdrop } from './BottomSheetBackdrop';
import { Button, LanguageList } from '@/components-next';
import { tailwind } from '@/theme';
import { useRefsContext, RefsProvider } from '@/context/RefsContext';

export default {
  title: 'Bottom Sheet',
  argTypes: {
    backdropComponent: { control: false },
  },
  decorators: [
    Story => (
      <BottomSheetModalProvider>
        <RefsProvider>
          <View style={tailwind.style('flex-1 bg-white p-4')}>
            <Story />
          </View>
        </RefsProvider>
      </BottomSheetModalProvider>
    ),
  ],
} satisfies Meta<typeof BottomSheetModal>;

export const LanguageSelectorSheet = () => {
  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const { languagesModalSheetRef } = useRefsContext();

  const handleOpenPress = () => {
    languagesModalSheetRef.current?.present();
  };

  return (
    <>
      <Button text="Select Language" handlePress={handleOpenPress} />

      <BottomSheetModal
        ref={languagesModalSheetRef}
        backdropComponent={props => <BottomSheetBackdrop {...props} />}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        detached
        enablePanDownToClose
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('overflow-hidden')}
        snapPoints={['70%']}>
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
          <BottomSheetHeader headerText="Select Language" />
          <LanguageList
            currentLanguage="en"
            onChangeLanguage={locale => {
              console.log('Selected language:', locale);
              languagesModalSheetRef.current?.dismiss();
            }}
          />
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
};
