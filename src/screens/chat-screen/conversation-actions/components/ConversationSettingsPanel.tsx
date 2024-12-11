import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { Agent, ConversationPriority, Team } from '@/types';
import AssigneePanel from './AssigneePanel';
import TeamPanel from './TeamPanel';
import PriorityPanel from './PriorityPanel';

type ConversationSettingsPanelProps = {
  priority: ConversationPriority;
  team: Team | null;
  assignee: Agent | null;
  onChangeAssignee: () => void;
  onChangeTeamAssignee: () => void;
  onChangePriority: () => void;
};

export const ConversationSettingsPanel = ({
  assignee,
  team,
  priority,
  onChangeAssignee,
  onChangeTeamAssignee,
  onChangePriority,
}: ConversationSettingsPanelProps) => {
  return (
    <Animated.View style={[tailwind.style('rounded-[13px] mx-4 bg-white'), styles.listShadow]}>
      <AssigneePanel assignee={assignee} onPress={onChangeAssignee} />
      <TeamPanel team={team} onPress={onChangeTeamAssignee} />
      <PriorityPanel priority={priority} onPress={onChangePriority} />
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
