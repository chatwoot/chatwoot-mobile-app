import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { StackActions, useNavigation } from '@react-navigation/native';

import { Icon, Avatar } from '@/components-next/common';
import { CloseIcon } from '@/svg-icons';
import { tailwind } from '@/theme';

type ContactDetailsScreenHeaderProps = {
  name: string;
  thumbnail: string;
  bio: string;
};

export const ContactDetailsScreenHeader = (props: ContactDetailsScreenHeaderProps) => {
  const navigation = useNavigation();

  const { name, thumbnail, bio } = props;
  const handleBackPress = () => {
    navigation.dispatch(StackActions.pop());
  };

  return (
    <Animated.View
      style={tailwind.style(
        'flex flex-row items-start px-4 border-b-[1px] border-b-blackA-A3 py-[13px]',
      )}>
      <Pressable hitSlop={16} onPress={handleBackPress} style={tailwind.style('flex-1')}>
        <Animated.View>
          <Icon icon={<CloseIcon />} size={24} />
        </Animated.View>
      </Pressable>
      <Animated.View>
        <Animated.View style={tailwind.style('flex items-center')}>
          <Avatar size="4xl" src={thumbnail ? { uri: thumbnail } : undefined} name={name} />
          <Animated.View style={tailwind.style('flex flex-col items-center gap-1 pt-3')}>
            <Animated.Text style={tailwind.style('text-[21px] font-inter-580-24 text-gray-950')}>
              {name}
            </Animated.Text>
            <Animated.Text
              style={tailwind.style(
                'text-[15px] font-inter-420-20 leading-[17.25px] text-gray-900',
              )}>
              {bio}
            </Animated.Text>
          </Animated.View>
        </Animated.View>
      </Animated.View>
      <Animated.View style={tailwind.style('flex-1 items-end')}>
        {/* <Icon icon={<Overflow strokeWidth={2} />} size={24} /> */}
      </Animated.View>
    </Animated.View>
  );
};
