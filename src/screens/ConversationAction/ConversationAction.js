/* eslint-disable react/prop-types */
import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import createStyles from './ConversationAction.style';
import ConversationActionItem from '../../components/ConversationActionItem';
import ConversationActionSquareItem from '../../components/ConversationActionSquareItem';
import i18n from '../../i18n';
import { selectUserId } from 'reducer/authSlice';
import { inboxAgentSelectors } from 'reducer/inboxAgentsSlice';

const ConversationActionComponent = ({ onPressAction, conversationDetails }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const agents = useSelector(state => inboxAgentSelectors.inboxAssignedAgents(state));
  const userId = useSelector(selectUserId);
  const {
    meta: { assignee, team },
  } = conversationDetails;

  let assignedAgent = {
    name: 'Select Agent',
    thumbnail: '',
  };
  if (assignee) {
    assignedAgent = agents.find(item => item.id === assignee.id);
  }
  const shouldShowSelfAssign = !assignee || (assignee && assignee.id !== userId);

  const { muted } = conversationDetails;

  return (
    <React.Fragment>
      <View style={styles.squareLayoutWrap}>
        {!muted ? (
          <ConversationActionSquareItem
            onPressItem={onPressAction}
            iconName="speaker-mute-outline"
            colors={colors}
            text={i18n.t('CONVERSATION.MUTE_CONVERSATION')}
            itemType="mute_conversation"
          />
        ) : (
          <ConversationActionSquareItem
            onPressItem={onPressAction}
            iconName="speaker-1-outline"
            text={i18n.t('CONVERSATION.UNMUTE_CONVERSATION')}
            colors={colors}
            itemType="unmute_conversation"
          />
        )}

        <ConversationActionSquareItem
          onPressItem={onPressAction}
          iconName="tag-outline"
          text={i18n.t('CONVERSATION.LABELS')}
          colors={colors}
          itemType="label"
        />

        <ConversationActionSquareItem
          onPressItem={onPressAction}
          iconName="share-outline"
          text={i18n.t('CONVERSATION.SHARE')}
          colors={colors}
          itemType="share"
        />

        <ConversationActionSquareItem
          onPressItem={onPressAction}
          iconName="info-outline"
          text={i18n.t('CONVERSATION.DETAILS')}
          colors={colors}
          itemType="details"
        />
      </View>
      <ConversationActionItem
        onPressItem={onPressAction}
        text="Assigned Agent"
        itemType="assignee"
        iconName="people-outline"
        colors={colors}
        name={assignedAgent.name}
        thumbnail={assignedAgent.thumbnail}
        availabilityStatus={assignedAgent.availability_status}
      />

      <ConversationActionItem
        onPressItem={onPressAction}
        text="Team"
        itemType="team"
        colors={colors}
        iconName="people-team-outline"
        name={team ? team.name : 'Select Team'}
      />

      {shouldShowSelfAssign && (
        <ConversationActionItem
          onPressItem={onPressAction}
          iconName="person-arrow-left-outline"
          text={i18n.t('CONVERSATION.SELF_ASSIGN')}
          colors={colors}
          itemType="self_assign"
        />
      )}
      {assignee && (
        <ConversationActionItem
          onPressItem={onPressAction}
          iconName="person-arrow-right-outline"
          colors={colors}
          text={i18n.t('CONVERSATION.UN_ASSIGN')}
          itemType="unassign"
        />
      )}

      <ConversationActionItem
        onPressItem={onPressAction}
        iconName="snooze-outline"
        text={i18n.t('CONVERSATION.SNOOZE')}
        colors={colors}
        itemType="snooze"
      />

      <ConversationActionItem
        onPressItem={onPressAction}
        iconName="channel-close-outline"
        text={i18n.t('CONVERSATION.CLOSE')}
        colors={colors}
        itemType="close"
      />
    </React.Fragment>
  );
};

export default ConversationActionComponent;
