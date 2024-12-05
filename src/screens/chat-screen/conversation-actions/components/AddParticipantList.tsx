import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { AddParticipant, Overflow } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Avatar, Icon } from '@/components-next';

const peopleList = [
  {
    name: 'Howard Stark',
    imageSource: require('../../../../assets/local/avatars/avatar-image.png'),
  },
  {
    imageSource: require('../../../../assets/local/avatars/avatar-image-1.png'),
    name: 'Bob Smith',
  },
  {
    imageSource: require('../../../../assets/local/avatars/avatar-image-2.png'),
    name: 'Eva White',
  },
  {
    imageSource: require('../../../../assets/local/avatars/avatar-image-3.png'),
    name: 'Michael Davis',
  },
  {
    imageSource: require('../../../../assets/local/avatars/avatar-image-5.png'),
    name: 'Olivia Anderson',
  },
  {
    imageSource: require('../../../../assets/local/avatars/avatar-image-4.png'),
    name: 'Sophia Martinez',
  },
  {
    imageSource: require('../../../../assets/local/avatars/avatar-image.png'),
    name: 'Liam Brown',
  },
  {
    imageSource: require('../../../../assets/local/avatars/avatar-image-1.png'),
    name: 'Emma Lee',
  },
  {
    imageSource: require('../../../../assets/local/avatars/avatar-image-2.png'),
    name: 'Noah Wilson',
  },
  {
    imageSource: require('../../../../assets/local/avatars/avatar-image-3.png'),
    name: 'Ava Johnson',
  },
  {
    imageSource: require('../../../../assets/local/avatars/avatar-image-5.png'),
    name: 'Lucas Clark',
  },
  {
    imageSource: require('../../../../assets/local/avatars/avatar-image-4.png'),
    name: 'Isabella Hall',
  },
];

type ListItemProps = {
  listItem: (typeof peopleList)[0];
  index: number;
};

const ListItem = (props: ListItemProps) => {
  const { listItem, index } = props;
  return (
    <Pressable
      key={index}
      style={({ pressed }) => [
        tailwind.style(pressed ? 'bg-gray-100' : '', index === 0 ? 'rounded-t-[13px]' : ''),
      ]}>
      <Animated.View style={tailwind.style('flex flex-row items-center ml-3')}>
        <Animated.View>
          <Avatar src={listItem.imageSource} size="lg" />
        </Animated.View>
        <Animated.View
          style={tailwind.style('flex-1 py-[11px] ml-2 border-b-[1px] border-b-blackA-A3')}>
          <Animated.Text
            style={tailwind.style(
              'text-base font-inter-420-20 leading-[22px] tracking-[0.16px] text-gray-950',
            )}>
            {listItem.name}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export const AddParticipantList = () => {
  return (
    <Animated.View>
      <Animated.View style={tailwind.style('pl-4 pb-3')}>
        <Animated.Text
          style={tailwind.style(
            'text-sm font-inter-medium-24 tracking-[0.32px] leading-[16px] text-gray-700',
          )}>
          Participants
        </Animated.Text>
      </Animated.View>
      <Animated.View style={[tailwind.style('rounded-[13px] mx-4 bg-white'), styles.listShadow]}>
        {peopleList.slice(0, 4).map((listItem, index) => {
          return <ListItem key={index} {...{ listItem, index }} />;
        })}
        <Pressable style={({ pressed }) => [tailwind.style(pressed ? 'bg-gray-100' : '')]}>
          <Animated.View style={tailwind.style('flex flex-row items-center ml-3')}>
            <Animated.View>
              <Icon icon={<Overflow stroke={tailwind.color('text-gray-600')} />} size={28} />
            </Animated.View>
            <Animated.View
              style={tailwind.style('flex-1 py-[11px] ml-2 border-b-[1px] border-b-blackA-A3')}>
              <Animated.Text
                style={tailwind.style(
                  'text-base font-inter-420-20 leading-[22px] tracking-[0.16px] text-gray-950',
                )}>
                {peopleList.length - 4} participants
              </Animated.Text>
            </Animated.View>
          </Animated.View>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            tailwind.style('rounded-b-[13px]', pressed ? 'bg-blue-100' : ''),
          ]}>
          <Animated.View style={tailwind.style('flex flex-row items-center ml-3')}>
            <Animated.View style={tailwind.style('p-0.5')}>
              <Icon icon={<AddParticipant stroke={tailwind.color('text-blue-800')} />} size={24} />
            </Animated.View>
            <Animated.View style={tailwind.style('flex-1 py-[11px] ml-2')}>
              <Animated.Text
                style={tailwind.style(
                  'text-base font-inter-420-20 leading-[22px] tracking-[0.16px] text-blue-800',
                )}>
                Add Participant
              </Animated.Text>
            </Animated.View>
          </Animated.View>
        </Pressable>
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
