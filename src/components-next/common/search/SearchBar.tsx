import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import Animated, { withTiming } from 'react-native-reanimated';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

import { SearchIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { RenderPropType } from '@/types';
import { Spinner } from '@/components-next/spinner';
import { Icon } from '../icon';

interface SearchBarProps extends TextInputProps {
  isLoading?: boolean;
  prefix?: RenderPropType;
  isInsideBottomSheet?: boolean;
}

export const SearchBar = (props: SearchBarProps) => {
  const { isLoading = false, prefix, isInsideBottomSheet = false, ...otherProps } = props;

  // Row Exit Animation
  const exiting = () => {
    'worklet';
    const animations = {
      opacity: withTiming(0, { duration: 250 }),
    };
    const initialValues = {
      opacity: 1,
    };
    return {
      initialValues,
      animations,
    };
  };

  const SearchTextInput = isInsideBottomSheet ? BottomSheetTextInput : TextInput;

  return (
    <Animated.View exiting={exiting} style={tailwind.style('px-3 h-[36px] relative')}>
      <Animated.View
        style={tailwind.style(
          'flex items-center justify-center absolute bg-transparent z-10 inset-y-0 left-0',
          'pl-5.5',
        )}>
        <Icon icon={prefix ? prefix : <SearchIcon />} size={18} />
      </Animated.View>
      <SearchTextInput
        style={[
          tailwind.style(
            'h-9 px-8.5 py-[7px] bg-blackA-A3 text-black text-base font-inter-normal-20 leading-[19.5px] rounded-[11px]',
            isLoading ? 'px-8.5' : 'pl-8.5 pr-4',
          ),
        ]}
        placeholderTextColor={tailwind.color('text-gray-800')}
        {...otherProps}
      />
      {isLoading ? (
        <Spinner
          size={18}
          style={tailwind.style('absolute bg-transparent z-10 inset-y-0 right-0 mr-5.5')}
        />
      ) : null}
    </Animated.View>
  );
};
