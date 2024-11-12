import React, { useMemo, useReducer, useState } from 'react';
import { Dimensions, Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { useRefsContext } from '../../context';
import { AddIcon, LabelTag } from '../../svg-icons';
import { tailwind } from '../../theme';
import { LabelType } from '../../types';
import { useScaleAnimation } from '../../utils';
import { BottomSheetBackdrop, Icon, SearchBar } from '../common';

import { LabelStack, allLabels } from '@/screens/conversations/components/conversation-sheet';

const { width } = Dimensions.get('screen');

/**
 * Chat GPT Generated Function
 *
 * The function filters an array of LabelType objects based on a search term by converting both the
 * search term and the label text to lowercase and checking if the label text includes the search term.
 * @param {LabelType[]} array - An array of objects of type LabelType. Each object in the array has a
 * property called labelText, which is a string.
 * @param {string} searchTerm - The `searchTerm` parameter is a string that represents the term you
 * want to search for in the `array`.
 * @returns an array of LabelType objects that match the search term.
 */

function filterArrayBySearch(array: LabelType[], searchTerm: string): LabelType[] {
  // Create a memoized version of toLowerCase
  const toLowerCaseMemoized = memoize((str: string) => str.toLowerCase());

  // Convert the search term to lowercase
  const searchTermLower = toLowerCaseMemoized(searchTerm);

  // Use the filter method with memoized item conversion
  const filteredArray = array.filter((item: LabelType) => {
    // Convert the label text to lowercase using memoized function
    const labelLower = toLowerCaseMemoized(item.labelText);

    // Check if the label text includes the search term
    return labelLower.includes(searchTermLower);
  });

  return filteredArray;
}

/**
 * Chat GPT Generated Function
 *
 * The `memoize` function is a higher-order function that caches the results of a given function based
 * on its input arguments.
 * @param fn - The `fn` parameter is a function that takes an argument of type `T` and returns a result
 * of type `R`.
 * @returns The `memoize` function returns a new function that takes an argument of type `T` and
 * returns a result of type `R`.
 */
function memoize<T, R>(fn: (arg: T) => R): (arg: T) => R {
  const cache = new Map<T, R>();
  return function (arg: T): R {
    if (cache.has(arg)) {
      return cache.get(arg)!;
    } else {
      const result = fn(arg);
      cache.set(arg, result);
      return result;
    }
  };
}

type LabelItemProps = {
  item: LabelType;
  isLastItem: boolean;
  index: number;
};

const LabelItem = (props: LabelItemProps) => {
  const { item } = props;
  return (
    <Animated.View
      style={[
        styles.labelShadow,
        tailwind.style('flex flex-row items-center bg-white px-3 py-[7px] rounded-lg mr-2 mt-3'),
      ]}>
      <Animated.View style={tailwind.style('h-2 w-2 rounded-full', `${item.labelColor}`)} />
      <Animated.Text
        style={tailwind.style(
          'text-md font-inter-normal-24 leading-[17px] tracking-[0.32px] pl-1.5 text-gray-950',
        )}>
        {item.labelText}
      </Animated.Text>
    </Animated.View>
  );
};

interface LabelSectionProps {
  labelList: LabelType[];
}

type AddLabelButtonProps = {
  searchTerm: string;
  handleOnPress: () => void;
};

const AddLabelButton = (props: AddLabelButtonProps) => {
  const { searchTerm, handleOnPress } = props;
  const { animatedStyle, handlers } = useScaleAnimation();

  return (
    <Animated.View style={[tailwind.style('pl-3 py-2'), animatedStyle]}>
      <Pressable onPress={handleOnPress} {...handlers}>
        <Animated.View style={tailwind.style('flex-row items-center justify-start')}>
          <Animated.View style={tailwind.style('p-[2px]')}>
            <Icon icon={<LabelTag />} size={24} />
          </Animated.View>
          <Animated.Text
            numberOfLines={1}
            ellipsizeMode={'middle'}
            style={[
              tailwind.style(
                'pl-1.5 text-base text-blue-800 font-inter-420-20 leading-[22px] tracking-[0.16px]',
                `max-w-[${width - 24 - 24 - 48}px]`,
              ),
            ]}>
            Add "{searchTerm}"
          </Animated.Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// Define the action types
enum ActionType {
  ADD_LABEL = 'ADD_LABEL',
  REMOVE_LABEL = 'REMOVE_LABEL',
}

// Define the action interface
interface Action {
  type: ActionType;
  payload?: LabelType;
}

// Reducer function to manage labels
const labelReducer = (state: LabelType[], action: Action): LabelType[] => {
  switch (action.type) {
    case ActionType.ADD_LABEL:
      return [...state, action.payload!];
    case ActionType.REMOVE_LABEL:
      return state.filter(label => label !== action.payload);
    default:
      return state;
  }
};

export const LabelSection = (props: LabelSectionProps) => {
  const { labelList } = props;

  const { bottom } = useSafeAreaInsets();
  const { addLabelSheetRef } = useRefsContext();

  const [searchTerm, setSearchTerm] = useState('');

  const [localLabels, dispatch] = useReducer(labelReducer, allLabels);
  const [currentLabels, dispatchCurrentLabelAction] = useReducer(labelReducer, labelList);

  const handleAddLabelPress = () => {
    addLabelSheetRef.current?.present();
  };

  const handleOnSubmitEditing = () => {
    addLabelSheetRef.current?.close();
  };

  const handleChangeText = (text: string) => {
    setSearchTerm(text);
  };

  const filteredResult = useMemo(
    () => filterArrayBySearch(localLabels, searchTerm),
    [localLabels, searchTerm],
  );

  const handleOnPressAddLabel = () => {
    dispatch({
      type: ActionType.ADD_LABEL,
      payload: { labelText: searchTerm, labelColor: 'bg-rose-800' },
    });
    dispatchCurrentLabelAction({
      type: ActionType.ADD_LABEL,
      payload: { labelText: searchTerm, labelColor: 'bg-rose-800' },
    });
    addLabelSheetRef.current?.close();
    setSearchTerm('');
  };

  const handleChange = (index: number) => {
    if (index === -1) {
      setSearchTerm('');
    }
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
        {currentLabels.map((label, index) => (
          <LabelItem
            key={index}
            index={index}
            item={label}
            isLastItem={index === localLabels.length - 1}
          />
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
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('mx-3 rounded-[26px] -mt-3')}
        bottomInset={bottom}
        enablePanDownToClose
        detached
        snapPoints={[316]}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        onChange={handleChange}>
        <SearchBar
          isInsideBottomsheet
          onSubmitEditing={handleOnSubmitEditing}
          autoFocus
          prefix={<AddIcon />}
          onChangeText={handleChangeText}
          placeholder="Add label"
          returnKeyLabel="done"
          returnKeyType="done"
        />
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
          <LabelStack
            handleLabelPress={() => null}
            labelList={filteredResult}
            isStandAloneComponent={filteredResult.length > 3}
          />
          <Animated.View style={tailwind.style('items-start')}>
            {filteredResult.length < 3 ? (
              <AddLabelButton {...{ searchTerm }} handleOnPress={handleOnPressAddLabel} />
            ) : undefined}
          </Animated.View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  labelShadow: {
    // box-shadow: 0px 0.15000000596046448px 2px 0px #00000040;
    // box-shadow: [horizontal offset] [vertical offset] [blur radius] [optional spread radius] [color];
    shadowColor: '#00000040',
    shadowOffset: { width: 0, height: 0.15 },
    shadowRadius: 2,
    shadowOpacity: 0.35,
    elevation: 2,
  },
});
