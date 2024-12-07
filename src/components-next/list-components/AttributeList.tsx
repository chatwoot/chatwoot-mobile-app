import React, { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import Clipboard from '@react-native-clipboard/clipboard';

import { CaretRight } from '@/svg-icons';
import { tailwind } from '@/theme';
import { AttributeListType } from '@/types';
import { Icon } from '@/components-next/common';
import { openURL } from '@/helpers/UrlHelper';
import { showToast } from '@/helpers/ToastHelper';

type AttributeItemProps = {
  listItem: AttributeListType;
  index: number;
  isLastItem: boolean;
};

const AttributeItem = (props: AttributeItemProps) => {
  const { listItem, index, isLastItem } = props;

  const handlePress = () => {
    if (listItem.type === 'link') {
      openURL({ URL: listItem.subtitle });
    } else if (listItem.subtitle) {
      Clipboard.setString(listItem.subtitle);
      showToast({ message: `${listItem.title} copied to clipboard` });
    }
  };

  const formattedDate = useMemo(() => {
    return listItem.subtitle ? new Date(listItem.subtitle).toLocaleDateString() : '';
  }, [listItem.subtitle]);

  const formattedValue = useMemo(() => {
    if (listItem.type === 'date') {
      return formattedDate;
    }
    if (listItem.type === 'checkbox') {
      return listItem.subtitle ? 'Yes' : 'No';
    }
    return listItem.subtitle;
  }, [listItem.type, listItem.subtitle, formattedDate]);

  return (
    <Pressable
      onPress={handlePress}
      key={index}
      style={({ pressed }) => [
        tailwind.style(
          pressed ? 'bg-gray-100' : '',
          index === 0 ? 'rounded-t-[13px]' : '',
          isLastItem ? 'rounded-b-[13px]' : '',
        ),
      ]}>
      <Animated.View style={tailwind.style('flex flex-row items-center pl-3')}>
        <Animated.View
          style={tailwind.style(
            'flex-1 flex-row items-center justify-between py-[11px]',
            listItem.icon ? 'ml-3' : '',
            !isLastItem ? 'border-b-[1px] border-b-blackA-A3' : '',
          )}>
          <Animated.View>
            <Animated.Text
              style={tailwind.style(
                'text-base font-inter-420-20 leading-[22px] tracking-[0.16px] text-gray-950',
              )}>
              {listItem.title}
            </Animated.Text>
          </Animated.View>
          <Animated.View style={tailwind.style('flex flex-row items-center pr-3')}>
            <Animated.Text
              style={tailwind.style(
                'text-base font-inter-normal-20 leading-[22px] tracking-[0.16px]',
                listItem.subtitleType === 'light' ? 'text-gray-900' : 'text-gray-950',
                listItem.type === 'link' ? 'text-blue-800 underline' : '',
              )}>
              {formattedValue}
            </Animated.Text>
            {listItem.hasChevron ? <Icon icon={<CaretRight />} size={20} /> : null}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

type AttributeListProps = {
  sectionTitle?: string;
  list: AttributeListType[];
};
export const AttributeList = (props: AttributeListProps) => {
  const { list, sectionTitle } = props;

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
      <Animated.View style={[tailwind.style('rounded-[13px] mx-4 bg-white'), styles.listShadow]}>
        {list.map(
          (listItem, index) =>
            !listItem.disabled &&
            listItem.subtitle && (
              <AttributeItem
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
  listShadow: {
    // box-shadow: 0px 0.15000000596046448px 2px 0px #00000040;
    // box-shadow: [horizontal offset] [vertical offset] [blur radius] [optional spread radius] [color];
    shadowColor: '#00000040',
    shadowOffset: { width: 0, height: 0.15 },
    shadowRadius: 2,
    shadowOpacity: 0.35,
    elevation: 2,
  },
});
