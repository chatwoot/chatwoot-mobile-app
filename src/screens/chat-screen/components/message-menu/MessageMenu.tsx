import React, {
  forwardRef,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomSheetBackdropProps,
  BottomSheetModal,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import * as ContextMenu from 'zeego/context-menu';

import { tailwind } from '@/theme';
import { BottomSheetHeader, BottomSheetWrapper, Icon } from '@/components-next/common';

export type MenuOption = {
  title: string;
  icon: React.ReactNode | JSX.Element;
  handleOnPressMenuOption: () => void;
  destructive?: boolean;
};

type MessageMenuProps = {
  menuOptions: MenuOption[];
};

const ContextMenuTrigger = ContextMenu.create<React.ComponentProps<typeof ContextMenu.Trigger>>(
  props => (
    <ContextMenu.Trigger {...props} asChild>
      <View aria-role="button">{props.children}</View>
    </ContextMenu.Trigger>
  ),
  'Trigger',
);

const ContextMenuItem = ContextMenu.create<React.ComponentProps<typeof ContextMenu.Item>>(
  props => (
    <ContextMenu.Item {...props}>
      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        {props.children}
      </View>
    </ContextMenu.Item>
  ),
  'Item',
);

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
    // @ts-expect-error Bottom sheet dismiss method typing issue
    ref?.current?.dismiss({ overshootClamping: true });
  };

  return (
    <Pressable onPress={handleBackdropPress} style={style}>
      <Animated.View style={[tailwind.style('bg-blackA-A9'), style, animatedStyle]} />
    </Pressable>
  );
});

// Mounted only while the menu is open so idle rows don't build a bottom sheet.
const MessageActionsSheet = ({
  menuOptions,
  onClose,
}: {
  menuOptions: MenuOption[];
  onClose: () => void;
}) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const { bottom } = useSafeAreaInsets();

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  useEffect(() => {
    sheetRef.current?.present();
  }, []);

  const dismiss = () => {
    sheetRef.current?.dismiss();
  };

  const renderBackDrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <ContextMenuBottomSheetBackdrop
        {...backdropProps}
        // @ts-expect-error Backdrop component ref typing issue
        ref={sheetRef}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      backdropComponent={renderBackDrop}
      handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
      handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
      style={tailwind.style('mx-3 rounded-[26px] overflow-hidden')}
      detached
      bottomInset={bottom === 0 ? 12 : bottom}
      animationConfigs={animationConfigs}
      enablePanDownToClose
      snapPoints={[menuOptions.length * 44 + 4 + 37]}
      onDismiss={onClose}>
      <BottomSheetWrapper>
        <BottomSheetHeader headerText="Select action" />
        <Animated.View style={tailwind.style('py-1 pl-3')}>
          {menuOptions?.map((option, index) => {
            return (
              <Pressable
                key={option.title + index}
                onPress={() => {
                  dismiss();
                  option.handleOnPressMenuOption();
                }}
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
  );
};

export const MessageMenu = (props: PropsWithChildren<MessageMenuProps>) => {
  const { children, menuOptions } = props;

  const [isSheetMounted, setIsSheetMounted] = useState(false);

  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => scheduleOnRN(setIsSheetMounted, true));

  if (menuOptions?.length === 0) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  if (Platform.OS === 'android') {
    return (
      <React.Fragment>
        <GestureDetector gesture={longPressGesture}>{children}</GestureDetector>
        {isSheetMounted && (
          <MessageActionsSheet menuOptions={menuOptions} onClose={() => setIsSheetMounted(false)} />
        )}
      </React.Fragment>
    );
  }

  return (
    <ContextMenu.Root>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenu.Content>
        {menuOptions?.map(option => {
          return (
            <ContextMenuItem
              key={option.title}
              onSelect={option.handleOnPressMenuOption}
              destructive={option.destructive}>
              {option.icon}
              <ContextMenu.ItemTitle>{option.title}</ContextMenu.ItemTitle>
            </ContextMenuItem>
          );
        })}
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
};
