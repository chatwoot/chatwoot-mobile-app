import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/theme';
import { Agent } from '@/types';
import { Avatar } from '@/components-next';
type MentionUserProps = {
  agent: Agent;
  lastItem: boolean;
  onPress: () => void;
};
export const MentionUser = (props: MentionUserProps) => {
  const { lastItem, agent, onPress } = props;
  return (
    <Pressable onPress={onPress} style={tailwind.style('flex flex-row items-center')}>
      <Avatar src={{ uri: agent.thumbnail || undefined }} name={agent.name ?? ''} size="md" />
      <Animated.View
        style={tailwind.style(
          'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
          !lastItem ? 'border-b-[1px] border-blackA-A3' : '',
        )}>
        <Animated.Text
          style={[
            tailwind.style(
              'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px]',
            ),
          ]}>
          {agent.name}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};
