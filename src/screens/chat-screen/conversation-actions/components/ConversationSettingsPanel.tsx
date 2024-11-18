import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { CaretRight, PriorityIcon, WebsiteIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Avatar, Icon } from '@/components-next';
import { ConversationPriority } from '@/types';

type ConversationSettingsPanelProps = {
  name: string;
  thumbnail: string;
  priority: ConversationPriority;
};

export const ConversationSettingsPanel = ({
  name,
  thumbnail,
  priority,
}: ConversationSettingsPanelProps) => {
  return (
    <Animated.View style={[tailwind.style('rounded-[13px] mx-4 bg-white'), styles.listShadow]}>
      <Pressable
        style={({ pressed }) => [tailwind.style(pressed ? 'bg-gray-100' : '', 'rounded-t-[13px]')]}>
        <Animated.View style={tailwind.style('flex-row items-center justify-between pl-3')}>
          <Avatar size={'lg'} src={{ uri: thumbnail || '' }} name={name || ''} />
          <Animated.View
            style={tailwind.style(
              'flex-1 flex-row items-center justify-between py-[11px] ml-3 border-b-[1px] border-b-blackA-A3',
            )}>
            <Animated.Text
              style={tailwind.style(
                'text-base font-inter-420-20 leading-[22px] tracking-[0.16px] text-gray-950',
              )}>
              {name}
            </Animated.Text>
            <Animated.View style={tailwind.style('flex-row items-center pr-3')}>
              <Animated.Text
                style={tailwind.style(
                  'text-base font-inter-normal-24 leading-[22px] tracking-[0.16px] text-gray-900',
                )}>
                Reassign
              </Animated.Text>
              <Icon icon={<CaretRight />} size={20} />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Pressable>
      <Pressable style={({ pressed }) => [tailwind.style(pressed ? 'bg-gray-100' : '')]}>
        <Animated.View style={tailwind.style('flex-row items-center justify-between pl-3')}>
          <Icon icon={<WebsiteIcon />} size={28} />
          <Animated.View
            style={tailwind.style(
              'flex-1 flex-row items-center justify-between py-[11px] ml-3 border-b-[1px] border-b-blackA-A3',
            )}>
            <Animated.Text
              style={tailwind.style(
                'text-base font-inter-420-20 leading-[22px] tracking-[0.16px] text-gray-950',
              )}>
              Department
            </Animated.Text>
            <Animated.View style={tailwind.style('flex-row items-center pr-3')}>
              <Animated.Text
                style={tailwind.style(
                  'text-base font-inter-normal-24 leading-[22px] tracking-[0.16px] text-gray-900',
                )}>
                Marketing
              </Animated.Text>
              <Icon icon={<CaretRight />} size={20} />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Pressable>
      <Pressable
        style={({ pressed }) => [tailwind.style(pressed ? 'bg-gray-100' : '', 'rounded-b-[13px]')]}>
        <Animated.View style={tailwind.style('flex-row items-center justify-between pl-3')}>
          <Icon icon={<PriorityIcon />} size={28} />
          <Animated.View
            style={tailwind.style('flex-1 flex-row items-center justify-between py-[11px] ml-3')}>
            <Animated.Text
              style={tailwind.style(
                'text-base font-inter-420-20 leading-[22px] tracking-[0.16px] text-gray-950 capitalize',
              )}>
              {priority}
            </Animated.Text>
          </Animated.View>
          <Animated.View style={tailwind.style('flex-row items-center pr-3')}>
            <Animated.Text
              style={tailwind.style(
                'text-base font-inter-normal-24 leading-[22px] tracking-[0.16px] text-gray-900',
              )}>
              Change
            </Animated.Text>
            <Icon icon={<CaretRight />} size={20} />
          </Animated.View>
        </Animated.View>
      </Pressable>
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
