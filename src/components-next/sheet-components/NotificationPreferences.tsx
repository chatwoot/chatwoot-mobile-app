import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import Checkbox from 'expo-checkbox';
import { tailwind } from '@/theme';

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
      </Animated.View>
    </Animated.View>
  );
};
