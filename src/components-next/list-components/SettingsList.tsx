import { useTailwind } from '@/theme/useTailwind';
import React from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import Animated from 'react-native-reanimated';

import { CaretRight, TickIcon } from '@/svg-icons';
import { GenericListType } from '@/types';
import { Icon } from '@/components-next/common/icon';
import { useIOSListText, useIsSplitLayout } from '@/utils';

type GenericListProps = {
  sectionTitle?: string;
  list: GenericListType[];
};

type ListItemProps = {
  listItem: GenericListType;
  index: number;
  isLastItem: boolean;
  hideDivider?: boolean;
};

const ListItem = (props: ListItemProps) => {
  const tailwind = useTailwind();
  const { listItem, index, isLastItem, hideDivider } = props;
  const isDisabled = listItem.inactive || listItem.locked;

  return (
    <Pressable
      onPress={() => listItem.onPressListItem && listItem.onPressListItem()}
      key={index}
      disabled={isDisabled}
      accessibilityRole={listItem.checked === undefined ? undefined : 'checkbox'}
      accessibilityState={
        listItem.checked === undefined
          ? { disabled: isDisabled }
          : { checked: listItem.checked, disabled: isDisabled }
      }
      style={({ pressed }) => [
        tailwind.style(
          // Preserve the selected detail-pane row while supporting inactive controls.
          listItem.isSelected ? 'bg-[#EBEBEB]' : pressed ? 'bg-gray-100' : '',
          listItem.inactive ? 'opacity-40' : '',

          index === 0 ? 'rounded-t-[13px]' : '',
          isLastItem ? 'rounded-b-[13px]' : '',
        ),
      ]}>
      <Animated.View style={tailwind.style('flex flex-row items-center pl-3')}>
        {listItem.icon ? (
          <Animated.View>
            <Icon icon={listItem.icon} size={24} />
          </Animated.View>
        ) : null}
        <Animated.View
          style={tailwind.style(
            'flex-1 flex-row items-center justify-between py-[11px]',
            listItem.icon ? 'ml-3' : '',
            !isLastItem ? 'border-b-[1px]' : '',
            !isLastItem && (hideDivider ? 'border-b-transparent' : 'border-b-blackA-A3'),
          )}>
          <Animated.View>
            <Animated.Text
              style={tailwind.style(
                'text-base font-inter-420-20 leading-[22px] tracking-[0.16px]',
                listItem.locked ? 'text-slate-900' : 'text-gray-950',
              )}>
              {listItem.title}
            </Animated.Text>
          </Animated.View>
          <Animated.View style={tailwind.style('flex flex-row items-center pr-3')}>
            <Animated.Text
              style={tailwind.style(
                'text-base font-inter-normal-20 leading-[22px] tracking-[0.16px]',
                listItem.subtitleType === 'light' ? 'text-gray-900' : 'text-gray-950',
              )}>
              {listItem.subtitle}
            </Animated.Text>
            {listItem.hasChevron ? <Icon icon={<CaretRight />} size={20} /> : null}
            {listItem.checked !== undefined ? (
              <Animated.View
                style={tailwind.style(
                  'h-[22px] w-[22px] items-center justify-center rounded-[6px] border-[1.5px]',
                  listItem.checked && listItem.locked ? 'bg-slate-600 border-slate-600' : '',
                  listItem.checked && !listItem.locked ? 'bg-blue-800 border-blue-800' : '',
                  !listItem.checked ? 'border-gray-600' : '',
                )}>
                {listItem.checked ? <Icon icon={<TickIcon stroke="#FFFFFF" />} size={14} /> : null}
              </Animated.View>
            ) : null}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export const SettingsList = (props: GenericListProps) => {
  const tailwind = useTailwind();
  const { list, sectionTitle } = props;
  // iOS: flat cards, no shadow. In the open Duo's split view the list page is white, so the
  // cards are light gray; elsewhere it's iPhone Settings: white cards on a light gray page.
  const iosList = useIOSListText();
  const isSplit = useIsSplitLayout();

  return (
    <Animated.View>
      {sectionTitle ? (
        <Animated.View style={tailwind.style('pl-4 pb-3')}>
          <Animated.Text
            style={tailwind.style(
              'text-sm font-inter-medium-24 leading-[16px] tracking-[0.32px] text-gray-700',
            )}>
            {sectionTitle}
          </Animated.Text>
        </Animated.View>
      ) : null}
      <Animated.View
        style={[
          tailwind.style('rounded-[13px] mx-4', iosList && isSplit ? 'bg-gray-50' : 'bg-white'),
          iosList ? null : styles.listShadow,
        ]}>
        {list.map(
          (listItem, index) =>
            !listItem.disabled && (
              <ListItem
                key={index}
                {...{ listItem, index }}
                isLastItem={index === list.length - 1}
                // Like native lists, hide the dividers touching a selected row so the
                // highlight doesn't meet a slightly different line.
                hideDivider={!!listItem.isSelected || !!list[index + 1]?.isSelected}
              />
            ),
        )}
      </Animated.View>
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  listShadow:
    Platform.select({
      ios: {
        shadowColor: '#00000040',
        shadowOffset: { width: 0, height: 0.15 },
        shadowRadius: 2,
        shadowOpacity: 0.35,
        elevation: 2,
      },
      android: {
        elevation: 4,
      },
    }) || {}, // Add fallback empty object
});
