import { useTailwind } from '@/theme/useTailwind';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { Agent, ConversationPriority, Team } from '@/types';
import AssigneePanel from './AssigneePanel';
import TeamPanel from './TeamPanel';
import PriorityPanel from './PriorityPanel';
import { IOS_DESIGN } from '@/utils';
import { useIsInDetailPane } from '@/navigation/split/SplitViewContext';

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
  const tailwind = useTailwind();
  // iOS Settings style (flat white cards on a gray page) in the split view and on iOS.
  const isInPane = useIsInDetailPane() || IOS_DESIGN;
  return (
    <Animated.View
      // Flat (no shadow) on the split view pane's gray page, like iOS Settings.
      style={[tailwind.style('rounded-[13px] mx-4 bg-white'), isInPane ? null : styles.listShadow]}>
      <AssigneePanel assignee={assignee} onPress={onChangeAssignee} />
      <TeamPanel team={team} onPress={onChangeTeamAssignee} />
      <PriorityPanel priority={priority} onPress={onChangePriority} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  listShadow:
    Platform.select({
      ios: {
        shadowColor: '#00000040',
        shadowOffset: { width: 0, height: 0.15 },
        shadowRadius: 2,
        shadowOpacity: 0.35,
        elevation: 2,
      },
      android: {
        elevation: 4,
        backgroundColor: 'white',
      },
    }) || {}, // Add fallback empty object
});
