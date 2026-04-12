import React from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import Animated from 'react-native-reanimated';

import { CaretRight } from '@/svg-icons';
import { tailwind, useThemedStyles } from '@/theme';
import { GenericListType } from '@/types';
import { Icon } from '@/components-next/common/icon';

type GenericListProps = {
  sectionTitle?: string;
  list: GenericListType[];
};

type ListItemProps = {
  listItem: GenericListType;
  index: number;
  isLastItem: boolean;
};

const ListItem = (props: ListItemProps) => {
  const { listItem, index, isLastItem } = props;
  const styles = useThemedStyles();

  return (
    <Pressable
      onPress={() => listItem.onPressListItem && listItem.onPressListItem()}
      key={index}
      style={({ pressed }) => [
        tailwind.style(index === 0 ? 'rounded-t-[13px]' : '', isLastItem ? 'rounded-b-[13px]' : ''),
        pressed && styles.bgPressed,
      ]}
    >
      <Animated.View
        style={[tailwind.style('flex flex-row items-center'), !isLastItem && styles.borderStyle]}
      >
        {listItem.icon ? (
          <Animated.View style={tailwind.style('pl-3 py-[11px]')}>
            <Icon icon={listItem.icon} size={24} />
          </Animated.View>
        ) : null}
        <Animated.View
          style={tailwind.style(
            'flex-1 flex-row items-center justify-between py-[11px]',
            listItem.icon ? 'ml-3 pr-3' : 'px-3',
          )}
        >
          <Animated.View>
            <Animated.Text
              style={[
                tailwind.style('text-base font-inter-420-20 leading-[22px] tracking-[0.16px]'),
                styles.textPrimary,
              ]}
            >
              {listItem.title}
            </Animated.Text>
          </Animated.View>
          <Animated.View style={tailwind.style('flex flex-row items-center')}>
            <Animated.Text
              style={[
                tailwind.style('text-base font-inter-normal-20 leading-[22px] tracking-[0.16px]'),
                listItem.subtitleType === 'light' ? styles.textSecondary : styles.textPrimary,
              ]}
            >
              {listItem.subtitle}
            </Animated.Text>
            {listItem.hasChevron ? <Icon icon={<CaretRight />} size={20} /> : null}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export const SettingsList = (props: GenericListProps) => {
  const { list, sectionTitle } = props;
  const themedStyles = useThemedStyles();

  return (
    <Animated.View>
      {sectionTitle ? (
        <Animated.View style={tailwind.style('pl-4 pb-3')}>
          <Animated.Text
            style={[
              tailwind.style('text-sm font-inter-medium-24 leading-[16px] tracking-[0.32px]'),
              themedStyles.textTertiary,
            ]}
          >
            {sectionTitle}
          </Animated.Text>
        </Animated.View>
      ) : null}
      <Animated.View
        style={[tailwind.style('rounded-[13px] mx-4'), themedStyles.bgSecondary, styles.listShadow]}
      >
        {list.map(
          (listItem, index) =>
            !listItem.disabled && (
              <ListItem
                key={index}
                {...{ listItem, index }}
                isLastItem={index === list.length - 1}
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
