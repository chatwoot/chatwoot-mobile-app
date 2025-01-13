import React, { forwardRef, PropsWithChildren, useCallback, useRef } from 'react';
import { Platform, Pressable } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomSheetBackdropProps,
  BottomSheetModal,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { BottomSheetHeader, BottomSheetWrapper } from '@/components-next';
import { tailwind } from '@/theme';

export type DashboardList = {
  title: string;
  url?: string;
  onSelect: (url: string | undefined, title: string | undefined) => void;
};

// eslint-disable-next-line react/display-name
const DropdownMenuBottomSheetBackdrop = forwardRef<
  React.RefObject<BottomSheetModal>,
  BottomSheetBackdropProps
>((props, ref) => {
  const { animatedIndex, style } = props;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(animatedIndex.value, [-1, 0], [0, 1]),
    };
  });

  const handleBackdropPress = () => {
    // @ts-ignore
    ref?.current?.dismiss({ overshootClamping: true });
  };

  return (
    <Pressable onPress={handleBackdropPress} style={style}>
      <Animated.View style={[tailwind.style('bg-blackA-A9'), style, animatedStyle]} />
    </Pressable>
  );
});

type ChatDropdownMenuProps = {
  dropdownMenuList: DashboardList[];
  children: React.ReactNode | JSX.Element;
};

export const ChatDropdownMenu = (props: PropsWithChildren<ChatDropdownMenuProps>) => {
  const { children, dropdownMenuList } = props;

  const contextMenuSheetRef = useRef<BottomSheetModal>(null);
  const openSheet = () => {
    contextMenuSheetRef.current?.present();
  };
  const closeSheet = () => {
    contextMenuSheetRef.current?.close();
  };

  const { bottom } = useSafeAreaInsets();

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const renderBackDrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <DropdownMenuBottomSheetBackdrop
        {...backdropProps}
        // @ts-ignore
        ref={contextMenuSheetRef}
      />
    ),
    [],
  );

  if (Platform.OS === 'android') {
    return (
      <React.Fragment>
        <Pressable onPress={openSheet} style={tailwind.style('ml-4')} hitSlop={8}>
          {children}
        </Pressable>
        <BottomSheetModal
          ref={contextMenuSheetRef}
          backdropComponent={renderBackDrop}
          handleIndicatorStyle={tailwind.style(
            'overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]',
          )}
          handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
          style={tailwind.style('mx-3 rounded-[26px] overflow-hidden')}
          detached
          bottomInset={bottom === 0 ? 12 : bottom}
          animationConfigs={animationConfigs}
          enablePanDownToClose
          snapPoints={[dropdownMenuList.length * 44 + 4 + 37]}>
          <BottomSheetWrapper>
            <BottomSheetHeader headerText="Select action" />
            <Animated.View style={tailwind.style('py-1 pl-3')}>
              {dropdownMenuList?.map((option, index) => {
                const handleOnOptionSelect = () => {
                  option.onSelect(option.url, option.title);

                  setTimeout(() => {
                    closeSheet();
                  }, 100);
                };
                return (
                  <Pressable
                    key={option.title + index}
                    style={tailwind.style('flex flex-row items-center')}
                    onPress={handleOnOptionSelect}>
                    <Animated.View
                      style={tailwind.style(
                        'flex-1 flex-row justify-between py-[11px] pr-3',
                        index !== dropdownMenuList.length - 1
                          ? 'border-b-[1px] border-blackA-A3'
                          : '',
                      )}>
                      <Animated.Text
                        style={tailwind.style(
                          'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px] capitalize',
                        )}>
                        {option.title}
                      </Animated.Text>
                    </Animated.View>
                  </Pressable>
                );
              })}
            </Animated.View>
          </BottomSheetWrapper>
        </BottomSheetModal>
      </React.Fragment>
    );
  }
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger style={tailwind.style('ml-4')}>
        {/* @ts-ignore */}
        {children}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {dropdownMenuList.map(menuOption => {
          const handleOnOptionSelect = () => {
            menuOption.onSelect(menuOption.url, menuOption.title);
          };
          return (
            <DropdownMenu.Item onSelect={handleOnOptionSelect} key={menuOption.title}>
              <DropdownMenu.ItemTitle>{menuOption.title}</DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          );
        })}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
