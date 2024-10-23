import React, { useState } from 'react';
import { Path, Svg } from 'react-native-svg';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/theme';
import { Icon } from '@/components-next/common';

import { IconProps } from '../../types';

const TickIcon = ({ stroke = '#FFF' }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 20 20" fill="none">
      <Path
        d="M16.6667 5L7.50004 14.1667L3.33337 10"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

function MyCheckbox() {
  const [checked, setChecked] = useState(false);
  return (
    <Pressable
      style={tailwind.style(
        'w-4 h-4 justify-center items-center rounded border mr-3',
        checked ? 'bg-blue-900 border-blue-900' : 'bg-transparent border-slate-500',
      )}
      onPress={() => setChecked(!checked)}>
      {checked && <Icon icon={<TickIcon />} size={14} style={tailwind.style('text-white')} />}
    </Pressable>
  );
}

export const NotificationPreferences = () => {
  return (
    <Animated.View style={tailwind.style('py-4 px-3')}>
      <Animated.View style={tailwind.style('flex flex-row items-center')}>
        <Animated.View
          style={tailwind.style(
            'flex-1 ml-3 flex-row justify-between py-[11px] pr-3 border-b-[1px] border-blackA-A3',
          )}>
          <Animated.Text
            style={tailwind.style(
              'text-base font-semibold leading-[17px] tracking-[0.2px] text-gray-950',
            )}>
            Email Notifications
          </Animated.Text>
        </Animated.View>
      </Animated.View>
      <Animated.View style={tailwind.style('flex flex-row items-center')}>
        <Animated.View style={tailwind.style('flex-1 ml-3 flex-row items-center py-[11px] pr-3')}>
          {/* <Checkbox value={true} onValueChange={() => {}} style={tailwind.style('mr-3')} /> */}
          <MyCheckbox />
          <Animated.Text
            style={tailwind.style(
              'text-base font-inter-medium-24 leading-[17px] tracking-[0.24px] text-gray-950',
            )}>
            Conversation is assigned to you
          </Animated.Text>
        </Animated.View>
      </Animated.View>
      {/* <Animated.View style={tailwind.style('flex flex-row items-center')}>
        <Animated.View style={tailwind.style('flex-1 ml-3 flex-row items-center py-[11px] pr-3')}>
          <Checkbox value={true} onValueChange={() => {}} style={tailwind.style('mr-3')} />
          <Animated.Text
            style={tailwind.style(
              'text-base font-inter-medium-24 leading-[17px] tracking-[0.24px] text-gray-950',
            )}>
            Conversation is assigned to you
          </Animated.Text>
        </Animated.View>
      </Animated.View>
      <Animated.View style={tailwind.style('flex flex-row items-center')}>
        <Animated.View style={tailwind.style('flex-1 ml-3 flex-row items-center py-[11px] pr-3')}>
          <Checkbox value={true} onValueChange={() => {}} style={tailwind.style('mr-3')} />
          <Animated.Text
            style={tailwind.style(
              'text-base font-inter-medium-24 leading-[17px] tracking-[0.24px] text-gray-950',
            )}>
            Conversation is assigned to you
          </Animated.Text>
        </Animated.View>
      </Animated.View>
      <Animated.View style={tailwind.style('flex flex-row items-center')}>
        <Animated.View style={tailwind.style('flex-1 ml-3 flex-row items-center py-[11px] pr-3')}>
          <Checkbox value={true} onValueChange={() => {}} style={tailwind.style('mr-3')} />
          <Animated.Text
            style={tailwind.style(
              'text-base font-inter-medium-24 leading-[17px] tracking-[0.24px] text-gray-950',
            )}>
            Conversation is assigned to you
          </Animated.Text>
        </Animated.View>
      </Animated.View>
      <Animated.View style={tailwind.style('flex flex-row items-center')}>
        <Animated.View
          style={tailwind.style(
            'flex-1 ml-3 flex-row justify-between py-[11px] pr-3 border-b-[1px] border-blackA-A3',
          )}>
          <Animated.Text
            style={tailwind.style(
              'text-base font-semibold leading-[17px] tracking-[0.24px] text-gray-950',
            )}>
            Push Notifications
          </Animated.Text>
          <Pressable>
            <Animated.Text
              style={tailwind.style('text-base  leading-[17px] tracking-[0.2px] text-blue-900')}>
              Enable
            </Animated.Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
      <Animated.View style={tailwind.style('flex flex-row items-center')}>
        <Animated.View style={tailwind.style('flex-1 ml-3 flex-row items-center py-[11px] pr-3')}>
          <Checkbox value={true} onValueChange={() => {}} style={tailwind.style('mr-3')} />
          <Animated.Text
            style={tailwind.style(
              'text-base font-inter-medium-24 leading-[17px] tracking-[0.24px] text-gray-950',
            )}>
            Conversation is assigned to you
          </Animated.Text>
        </Animated.View>
      </Animated.View>
      <Animated.View style={tailwind.style('flex flex-row items-center')}>
        <Animated.View style={tailwind.style('flex-1 ml-3 flex-row items-center py-[11px] pr-3')}>
          <Checkbox value={true} onValueChange={() => {}} style={tailwind.style('mr-3')} />
          <Animated.Text
            style={tailwind.style(
              'text-base font-inter-medium-24 leading-[17px] tracking-[0.24px] text-gray-950',
            )}>
            Conversation is assigned to you
          </Animated.Text>
        </Animated.View>
      </Animated.View>
      <Animated.View style={tailwind.style('flex flex-row items-center')}>
        <Animated.View style={tailwind.style('flex-1 ml-3 flex-row items-center py-[11px] pr-3')}>
          <Checkbox value={true} onValueChange={() => {}} style={tailwind.style('mr-3')} />
          <Animated.Text
            style={tailwind.style(
              'text-base font-inter-medium-24 leading-[17px] tracking-[0.24px] text-gray-950',
            )}>
            Conversation is assigned to you
          </Animated.Text>
        </Animated.View>
      </Animated.View> */}
    </Animated.View>
  );
};
