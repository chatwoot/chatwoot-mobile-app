import React, { forwardRef, PropsWithChildren, useCallback, useRef } from 'react';
import { Platform, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolate, runOnJS, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomSheetBackdropProps,
  BottomSheetModal,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import * as ContextMenu from 'zeego/context-menu';

import { tailwind } from '../../../theme';
import { BottomSheetHeader, BottomSheetWrapper, Icon } from '../../common';

export type MenuOption = {
  title: string;
  icon: React.ReactNode | JSX.Element;
  handleOnPressMenuOption: () => void;
  destructive?: boolean;
};

type MessageMenuProps = {
  menuOptions: MenuOption[];
};

// eslint-disable-next-line react/display-name
const ContextMenuBottomSheetBackdrop = forwardRef<
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

export const MessageMenu = (props: PropsWithChildren<MessageMenuProps>) => {
  const { children, menuOptions } = props;

  const contextMenuSheetRef = useRef<BottomSheetModal>(null);
  const openSheet = () => {
    contextMenuSheetRef.current?.present();
  };
  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => runOnJS(openSheet)());

  const { bottom } = useSafeAreaInsets();

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const handleOnDismiss = () => {};

  const renderBackDrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <ContextMenuBottomSheetBackdrop
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
        <GestureDetector gesture={longPressGesture}>{children}</GestureDetector>
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
          snapPoints={[menuOptions.length * 44 + 4 + 37]}
          onDismiss={handleOnDismiss}>
          <BottomSheetWrapper>
            <BottomSheetHeader headerText="Select action" />
            <Animated.View style={tailwind.style('py-1 pl-3')}>
              {menuOptions?.map((option, index) => {
                return (
                  <Pressable
                    key={option.title + index}
                    style={tailwind.style('flex flex-row items-center')}>
                    <Animated.View>
                      <Icon icon={option.icon} size={24} />
                    </Animated.View>
                    <Animated.View
                      style={tailwind.style(
                        'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
                        index !== menuOptions.length - 1 ? 'border-b-[1px] border-blackA-A3' : '',
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
  return menuOptions?.length > 0 ? (
    <ContextMenu.Root>
      {/*
          The below children is a React Element but is not as per the types
          of the library so ignoring the issue
      */}
      <ContextMenu.Trigger action="longPress">
        {/* @ts-ignore */}
        {children}
      </ContextMenu.Trigger>

      <ContextMenu.Content>
        {menuOptions?.map(option => {
          return (
            <ContextMenu.Item
              onSelect={option.handleOnPressMenuOption}
              key={option.title}
              destructive={option.destructive}>
              <ContextMenu.ItemTitle>{option.title}</ContextMenu.ItemTitle>
              {option.icon}
            </ContextMenu.Item>
          );
        })}
      </ContextMenu.Content>
    </ContextMenu.Root>
  ) : (
    <React.Fragment>{children}</React.Fragment>
  );
};
