import React, { useState, useEffect } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { useRefsContext } from '@/context';
import { LabelTag } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Icon, SearchBar } from '@/components-next';
import { useAppSelector } from '@/hooks';
import { filterLabels } from '@/store/label/labelSelectors';

import { LabelItem } from '@/components-next/label-section';
import { LabelStack, LabelBackdrop } from './label-actions';

interface LabelActionsProps {
  labels: string[];
  onLabelsUpdate: (updatedLabels: string[]) => Promise<void> | void;
  sheetRef?: React.RefObject<BottomSheetModal>;
}

export const LabelActions = (props: LabelActionsProps) => {
  const { labels, onLabelsUpdate, sheetRef } = props;
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedLabels, setSelectedLabels] = useState(labels);

  useEffect(() => {
    setSelectedLabels(labels);
  }, [labels]);

  const { addLabelSheetRef: contextAddLabelSheetRef } = useRefsContext();
  const addLabelSheetRef = sheetRef || contextAddLabelSheetRef;

  // Custom backdrop that uses the instance's own ref instead of the shared context ref
  const backdropComponent = (props: Parameters<typeof LabelBackdrop>[0]) => (
    <LabelBackdrop {...props} sheetRef={addLabelSheetRef} />
  );

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
    addLabelSheetRef.current?.close();
  };

  const handleChangeText = (text: string) => {
    setSearchTerm(text);
  };

  const handleChange = (index: number) => {
    if (index === -1) {
      setSearchTerm('');
    }
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
          Labels
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
            Add
          </Animated.Text>
        </Pressable>
      </Animated.View>
      <BottomSheetModal
        ref={addLabelSheetRef}
        backdropComponent={backdropComponent}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        enablePanDownToClose
        snapPoints={[316]}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        onChange={handleChange}
        enableDynamicSizing={false}
        detached>
        <SearchBar
          isInsideBottomSheet
          onSubmitEditing={handleOnSubmitEditing}
          onChangeText={handleChangeText}
          placeholder="Search labels"
          returnKeyLabel="done"
          returnKeyType="done"
        />
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
          <LabelStack
            filteredLabels={filteredLabels}
            selectedLabels={selectedLabels}
            isStandAloneComponent={allLabels.length > 3}
            handleLabelPress={handleAddOrUpdateLabels}
          />
        </BottomSheetScrollView>
      </BottomSheetModal>
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
