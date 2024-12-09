import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { AddParticipant, Overflow } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Avatar, Icon } from '@/components-next';
import { Agent } from '@/types';
import i18n from '@/i18n';

type ListItemProps = {
  listItem: Agent;
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
          <Avatar src={listItem.thumbnail || undefined} size="lg" />
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

const ParticipantOverflowCell = ({ count }: { count: number }) => {
  return (
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
            {count} participants
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

type AddParticipantListProps = {
  conversationParticipants: Agent[];
  onAddParticipant: () => void;
};

export const AddParticipantList = (props: AddParticipantListProps) => {
  const { conversationParticipants, onAddParticipant } = props;

  const overflowCount = conversationParticipants?.length;
  return (
    <Animated.View>
      <Animated.View style={tailwind.style('pl-4 pb-3')}>
        <Animated.Text
          style={tailwind.style(
            'text-sm font-inter-medium-24 tracking-[0.32px] leading-[16px] text-gray-700',
          )}>
          {i18n.t('CONVERSATION_PARTICIPANTS.TITLE')}
        </Animated.Text>
      </Animated.View>
      <Animated.View style={[tailwind.style('rounded-[13px] mx-4 bg-white'), styles.listShadow]}>
        {conversationParticipants &&
          conversationParticipants.slice(0, 4).map((listItem, index) => {
            return <ListItem key={index} {...{ listItem, index }} />;
          })}
        {overflowCount > 3 && <ParticipantOverflowCell count={overflowCount - 4} />}
        <Pressable
          onPress={onAddParticipant}
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
                {i18n.t('CONVERSATION_PARTICIPANTS.ADD_PARTICIPANT')}
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
