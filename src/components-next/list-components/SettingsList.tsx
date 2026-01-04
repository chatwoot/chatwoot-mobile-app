import React from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import Animated from 'react-native-reanimated';

import { CaretRight } from '@/svg-icons';
import { tailwind } from '@/theme';
import { GenericListType } from '@/types';
import { Icon } from '@/components-next/common/icon';
import { useTheme } from '@/context/ThemeContext';

type GenericListProps = {
  sectionTitle?: string;
  list: GenericListType[];
};

type ListItemProps = {
  listItem: GenericListType;
  index: number;
  isLastItem: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
  isDark: boolean;
};

const ListItem = (props: ListItemProps) => {
  const { listItem, index, isLastItem, colors, isDark } = props;

  return (
    <Pressable
      onPress={() => listItem.onPressListItem && listItem.onPressListItem()}
      key={index}
      style={({ pressed }) => [
        tailwind.style(
          index === 0 ? 'rounded-t-[13px]' : '',
          isLastItem ? 'rounded-b-[13px]' : '',
        ),
        pressed && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
      ]}>
      <Animated.View style={tailwind.style('flex flex-row items-center pl-3')}>
        {listItem.icon ? (
          <Animated.View>
            <Icon icon={listItem.icon} size={24} />
          </Animated.View>
        ) : null}
        <Animated.View
          style={[
            tailwind.style(
              'flex-1 flex-row items-center justify-between py-[11px]',
              listItem.icon ? 'ml-3' : '',
            ),
            !isLastItem && { borderBottomWidth: 1, borderBottomColor: colors.divider },
          ]}>
          <Animated.View>
            <Animated.Text
              style={[
                tailwind.style('text-base font-inter-420-20 leading-[22px] tracking-[0.16px]'),
                { color: colors.text },
              ]}>
              {listItem.title}
            </Animated.Text>
          </Animated.View>
          <Animated.View style={tailwind.style('flex flex-row items-center pr-3')}>
            <Animated.Text
              style={[
                tailwind.style('text-base font-inter-normal-20 leading-[22px] tracking-[0.16px]'),
                { color: listItem.subtitleType === 'light' ? colors.textSecondary : colors.text },
              ]}>
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
  const { colors, isDark } = useTheme();

  return (
    <Animated.View>
      {sectionTitle ? (
        <Animated.View style={tailwind.style('pl-4 pb-3')}>
          <Animated.Text
            style={[
              tailwind.style('text-sm font-inter-medium-24 leading-[16px] tracking-[0.32px]'),
              { color: colors.textSecondary },
            ]}>
            {sectionTitle}
          </Animated.Text>
        </Animated.View>
      ) : null}
      <Animated.View 
        style={[
          tailwind.style('rounded-[13px] mx-4'), 
          { backgroundColor: colors.card },
          isDark ? styles.listShadowDark : styles.listShadow,
        ]}>
        {list.map(
          (listItem, index) =>
            !listItem.disabled && (
              <ListItem
                key={index}
                {...{ listItem, index, colors, isDark }}
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
    }) || {},
  listShadowDark:
    Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
        shadowOpacity: 0.3,
        elevation: 2,
      },
      android: {
        elevation: 4,
      },
    }) || {},
});
