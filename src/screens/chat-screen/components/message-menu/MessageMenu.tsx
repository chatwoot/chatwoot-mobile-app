import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import * as ContextMenu from 'zeego/context-menu';

import { tailwind } from '@/theme';
import { BottomSheetHeader, Icon } from '@/components-next/common';
import { Sheet, type SheetRef } from '@/components-next/common/sheet/Sheet';

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

// Mounted only while the menu is open so idle rows don't build a bottom sheet.
const MessageActionsSheet = ({
  menuOptions,
  onClose,
}: {
  menuOptions: MenuOption[];
  onClose: () => void;
}) => {
  const sheetRef = useRef<SheetRef>(null);

  useEffect(() => {
    sheetRef.current?.present();
  }, []);

  const dismiss = () => {
    sheetRef.current?.dismiss();
  };

  return (
    <Sheet ref={sheetRef} autoSize onDismiss={onClose}>
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
    </Sheet>
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
