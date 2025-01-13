import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { Icon } from '@/components-next';
import { CaretRight, TeamIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Team } from '@/types';
import i18n from '@/i18n';

type TeamPanelProps = {
  team: Team | null;
  onPress: () => void;
};

const TeamPanel = ({ team, onPress }: TeamPanelProps) => {
  const teamName = team ? team.name : i18n.t('CONVERSATION.ACTIONS.TEAM.EMPTY');
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [tailwind.style(pressed ? 'bg-gray-100' : '', 'rounded-t-[13px]')]}>
      <Animated.View style={tailwind.style('flex-row items-center justify-between pl-3')}>
        <Icon icon={<TeamIcon />} />
        <Animated.View
          style={tailwind.style(
            'flex-1 flex-row items-center justify-between py-[11px] ml-[10px] border-b-[1px] border-b-blackA-A3',
          )}>
          <Animated.Text
            style={tailwind.style(
              'text-base font-inter-420-20 leading-[22.4px] tracking-[0.16px] text-gray-950 capitalize',
            )}>
            {teamName}
          </Animated.Text>
          <Animated.View style={tailwind.style('flex-row items-center pr-3')}>
            <Animated.Text
              style={tailwind.style(
                'text-base font-inter-normal-20 leading-[22px] tracking-[0.16px] text-gray-900',
              )}>
              {i18n.t('CONVERSATION.ACTIONS.TEAM.ASSIGN')}
            </Animated.Text>
            <Icon icon={<CaretRight />} size={20} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export default TeamPanel;
