import React from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import Animated from 'react-native-reanimated';

import { CaretRight } from '@/svg-icons';
import { tailwind } from '@/theme';
import { GenericListType } from '@/types';
import { Icon } from '@/components-next/common/icon';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/context';

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
  const themedTailwind = useThemedStyles();
  const { isDark } = useTheme();

  return (
    <Pressable
      onPress={() => listItem.onPressListItem && listItem.onPressListItem()}
      key={index}
      style={({ pressed }) => [
        themedTailwind.style(
          pressed ? 'bg-gray-100' : '',
          index === 0 ? 'rounded-t-[13px]' : '',
          isLastItem ? 'rounded-b-[13px]' : '',
        ),
      ]}
    >
      <Animated.View style={themedTailwind.style('flex flex-row items-center pl-3')}>
        {listItem.icon ? (
          <Animated.View>
            <Icon icon={listItem.icon} size={24} />
          </Animated.View>
        ) : null}
        <Animated.View
          style={themedTailwind.style(
            'flex-1 flex-row items-center justify-between py-[11px]',
            listItem.icon ? 'ml-3' : '',
            !isLastItem ? 'border-b-[1px] border-b-blackA-A3' : '',
          )}
        >
          <Animated.View>
            <Animated.Text
              style={themedTailwind.style(
                'text-base font-inter-420-20 leading-[22px] tracking-[0.16px] text-gray-950',
              )}
            >
              {listItem.title}
            </Animated.Text>
          </Animated.View>
          <Animated.View style={themedTailwind.style('flex flex-row items-center pr-3')}>
            <Animated.Text
              style={themedTailwind.style(
                'text-base font-inter-normal-20 leading-[22px] tracking-[0.16px]',
                listItem.subtitleType === 'light' ? 'text-gray-900' : 'text-gray-950',
              )}
            >
              {listItem.subtitle}
            </Animated.Text>
            {listItem.hasChevron ? (
              <Icon icon={<CaretRight stroke={isDark ? '#FFFFFF' : undefined} />} size={20} />
            ) : null}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export const SettingsList = (props: GenericListProps) => {
  const { list, sectionTitle } = props;
  const themedTailwind = useThemedStyles();
  const { isDark } = useTheme();

  // Create theme-aware shadow styles
  const themedShadowStyles = {
    ...styles.listShadow,
    ...(Platform.OS === 'android' && {
      backgroundColor: isDark ? 'transparent' : 'white',
    }),
  };

  return (
    <Animated.View>
      {sectionTitle ? (
        <Animated.View style={themedTailwind.style('pl-4 pb-3')}>
          <Animated.Text
            style={themedTailwind.style(
              'text-sm font-inter-medium-24 leading-[16px] tracking-[0.32px] text-gray-700',
            )}
          >
            {sectionTitle}
          </Animated.Text>
        </Animated.View>
      ) : null}
      <Animated.View
        style={[themedTailwind.style('rounded-[13px] mx-4 bg-white'), themedShadowStyles]}
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
        backgroundColor: 'white',
      },
    }) || {}, // Add fallback empty object
});
