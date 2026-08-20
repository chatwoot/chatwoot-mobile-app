import React, { PropsWithChildren, useRef } from 'react';
import { Platform, Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { BottomSheetHeader } from '@/components-next';
import { Sheet, type SheetRef } from '@/components-next/common/sheet/Sheet';
import { tailwind } from '@/theme';

export type DashboardList = {
  title: string;
  url?: string;
  onSelect: (url: string | undefined, title: string | undefined) => void;
};

const DropdownMenuTrigger = DropdownMenu.create<React.ComponentProps<typeof DropdownMenu.Trigger>>(
  props => (
    <DropdownMenu.Trigger {...props} asChild>
      <View aria-role="button" style={tailwind.style('ml-4')}>
        {props.children}
      </View>
    </DropdownMenu.Trigger>
  ),
  'Trigger',
);

const DropdownMenuItem = DropdownMenu.create<React.ComponentProps<typeof DropdownMenu.Item>>(
  props => (
    <DropdownMenu.Item {...props}>
      <View style={tailwind.style('flex flex-row items-center')}>
        <DropdownMenu.ItemTitle
          style={tailwind.style(
            'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px] capitalize',
          )}>
          {props.children}
        </DropdownMenu.ItemTitle>
      </View>
    </DropdownMenu.Item>
  ),
  'Item',
);

type ChatDropdownMenuProps = {
  dropdownMenuList: DashboardList[];
  children: React.ReactNode | JSX.Element;
};

export const ChatDropdownMenu = (props: PropsWithChildren<ChatDropdownMenuProps>) => {
  const { children, dropdownMenuList } = props;

  const contextMenuSheetRef = useRef<SheetRef>(null);
  const openSheet = () => {
    contextMenuSheetRef.current?.present();
  };
  const closeSheet = () => {
    contextMenuSheetRef.current?.dismiss();
  };

  if (Platform.OS === 'android') {
    return (
      <React.Fragment>
        <Pressable onPress={openSheet} style={tailwind.style('ml-4')} hitSlop={8}>
          {children}
        </Pressable>
        <Sheet ref={contextMenuSheetRef} autoSize>
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
        </Sheet>
      </React.Fragment>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenu.Content>
        {dropdownMenuList.map(menuOption => {
          const handleOnOptionSelect = () => {
            menuOption.onSelect(menuOption.url, menuOption.title);
          };
          return (
            <DropdownMenuItem onSelect={handleOnOptionSelect} key={menuOption.title}>
              {menuOption.title}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
