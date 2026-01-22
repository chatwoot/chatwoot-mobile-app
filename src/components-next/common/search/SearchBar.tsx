import React from 'react';
import { TextInput, TextInputProps, ViewStyle, TextStyle, Pressable } from 'react-native'; // Adicionar Pressable e TextStyle
import Animated, { withTiming } from 'react-native-reanimated';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

import { SearchIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { RenderPropType } from '@/types';
import { Spinner } from '@/components-next/spinner';
import { Icon } from '../icon';

interface SearchBarProps extends TextInputProps {
  isLoading?: boolean;
  leftIcon?: RenderPropType;
  onLeftIconPress?: () => void;
  rightIcon?: RenderPropType;
  onRightIconPress?: () => void;
  isInsideBottomSheet?: boolean;
  bottomLeft?: RenderPropType;
  wrapperStyle?: Animated.AnimateStyle<ViewStyle>;
  inputStyle?: TextStyle; // Alterado para TextStyle
  isActive?: boolean;
}

export const SearchBar = (props: SearchBarProps) => {
  const {
    isLoading = false,
    leftIcon,
    onLeftIconPress,
    rightIcon,
    onRightIconPress,
    isInsideBottomSheet = false,
    bottomLeft,
    wrapperStyle,
    inputStyle,
    isActive = false,
    ...otherProps
  } = props;

  // Row Exit Animation (manter)
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
    <Animated.View
      exiting={exiting}
      style={[
        tailwind.style(
          'px-3 h-[36px] relative flex-row items-center',
          isActive ? 'flex-1 bg-white rounded-[11px]' : ''
        ),
        wrapperStyle,
      ]}>
      {leftIcon && (
        <Animated.View
          style={tailwind.style(
            'flex items-center justify-center absolute bg-transparent z-10 inset-y-0 left-0',
            'pl-5.5',
          )}>
          {onLeftIconPress ? (
            <Pressable onPress={onLeftIconPress}>
              <Icon icon={leftIcon} size={18} />
            </Pressable>
          ) : (
            <Icon icon={leftIcon} size={18} />
          )}
        </Animated.View>
      )}
      <SearchTextInput
        style={[
          tailwind.style(
            'flex-1 h-9 px-8.5 py-[7px] text-black text-base font-inter-normal-20 leading-[19.5px] rounded-[11px]',
            isActive ? 'bg-white' : 'bg-blackA-A3',
            isLoading ? 'pr-8.5' : 'pr-4',
            leftIcon ? 'pl-8.5' : 'pl-4'
          ),
          inputStyle,
        ]}
        placeholderTextColor={tailwind.color('text-gray-800')}
        {...otherProps}
      />
      {isLoading ? (
        <Spinner
          size={18}
          style={tailwind.style('absolute bg-transparent z-10 inset-y-0 right-0 mr-5.5')}
        />
      ) : rightIcon ? (
        <Animated.View
          style={tailwind.style(
            'flex items-center justify-center absolute bg-transparent z-10 inset-y-0 right-0',
            'pr-5.5',
          )}>
          {onRightIconPress ? (
            <Pressable onPress={onRightIconPress}>
              <Icon icon={rightIcon} size={18} />
            </Pressable>
          ) : (
            <Icon icon={rightIcon} size={18} />
          )}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
};
