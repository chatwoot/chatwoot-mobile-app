import React, { useState, useEffect } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { useRefsContext } from '@/context';
import { LabelTag } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Icon } from '@/components-next/common/icon';
import { SearchBar } from '@/components-next/common/search';
import { Sheet, type SheetRef } from '@/components-next/common/sheet/Sheet';
import { useAppSelector } from '@/hooks';
import { filterLabels } from '@/store/label/labelSelectors';

import { LabelItem } from '../LabelItem';
import { LabelStack } from './LabelStack';

interface LabelActionsProps {
  labels: string[];
  onLabelsUpdate: (updatedLabels: string[]) => Promise<void> | void;
  sheetRef?: React.RefObject<SheetRef | null>;
  titleText?: string;
  addLabelText?: string;
  searchPlaceholderText?: string;
}

export const LabelActions = (props: LabelActionsProps) => {
  const { labels, onLabelsUpdate, sheetRef, titleText, addLabelText, searchPlaceholderText } =
    props;
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedLabels, setSelectedLabels] = useState(labels);

  useEffect(() => {
    setSelectedLabels(labels);
  }, [labels]);

  const { addLabelSheetRef: contextAddLabelSheetRef } = useRefsContext();
  const addLabelSheetRef = sheetRef || contextAddLabelSheetRef;

  const allLabels = useAppSelector(state => filterLabels(state, ''));

  const filteredLabels = useAppSelector(state => filterLabels(state, searchTerm));

  const selectedLabelItems =
    allLabels && selectedLabels
      ? allLabels.filter(({ title }) => {
          return selectedLabels?.includes(title);
        })
      : [];

  const handleAddLabelPress = () => {
    addLabelSheetRef.current?.present();
  };

  const handleOnSubmitEditing = () => {
    addLabelSheetRef.current?.dismiss();
  };

  const handleChangeText = (text: string) => {
    setSearchTerm(text);
  };

  const handleAddOrUpdateLabels = async (label: string) => {
    setSelectedLabels(prevLabels => {
      const updatedLabels = prevLabels.includes(label)
        ? prevLabels.filter(item => item !== label)
        : [...prevLabels, label];

      onLabelsUpdate(updatedLabels);

      return updatedLabels;
    });
  };
  return (
    <Animated.View>
      <Animated.View style={tailwind.style('pl-4')}>
        <Animated.Text
          style={tailwind.style(
            'text-sm font-inter-medium-24 leading-[16px] tracking-[0.32px] text-gray-700',
          )}>
          {titleText}
        </Animated.Text>
      </Animated.View>
      <Animated.View style={tailwind.style('flex flex-row flex-wrap pl-4')}>
        {selectedLabelItems.map((label, index) => (
          <LabelItem key={index} index={index} item={label} />
        ))}
        <Pressable
          onPress={handleAddLabelPress}
          style={({ pressed }) => [
            styles.labelShadow,
            tailwind.style(
              'flex flex-row items-center bg-white px-3 py-[7px] rounded-lg mr-2 mt-3',
              pressed ? 'bg-blue-100' : '',
            ),
          ]}>
          <Icon icon={<LabelTag />} size={16} />
          <Animated.Text
            style={tailwind.style(
              'text-md font-inter-medium-24 leading-[17px] tracking-[0.24px] pl-1.5 text-blue-800',
            )}>
            {addLabelText}
          </Animated.Text>
        </Pressable>
      </Animated.View>
      <Sheet ref={addLabelSheetRef} height={316} scrollable onDismiss={() => setSearchTerm('')}>
        <SearchBar
          onSubmitEditing={handleOnSubmitEditing}
          onChangeText={handleChangeText}
          placeholder={searchPlaceholderText}
          returnKeyLabel="done"
          returnKeyType="done"
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <LabelStack
            filteredLabels={filteredLabels}
            selectedLabels={selectedLabels}
            isStandAloneComponent={allLabels.length > 3}
            handleLabelPress={handleAddOrUpdateLabels}
          />
        </ScrollView>
      </Sheet>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  labelShadow:
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
