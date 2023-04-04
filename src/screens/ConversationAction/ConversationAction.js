/* eslint-disable react/prop-types */
import React from 'react';
import { useTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import ConversationActionItem from '../../components/ConversationActionItem';
import i18n from '../../i18n';
import { selectUserId } from 'reducer/authSlice';
import { inboxAgentSelectors } from 'reducer/inboxAgentsSlice';
import differenceInHours from 'date-fns/differenceInHours';
import { CONVERSATION_STATUS } from 'src/constants/index';

const ConversationActionComponent = ({ onPressAction, conversationDetails }) => {
  const theme = useTheme();
  const { colors } = theme;
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

  const isSnoozed = conversationDetails.status === CONVERSATION_STATUS.SNOOZED;

  const snoozeDisplayText = () => {
    const { snoozed_until: snoozedUntil } = conversationDetails;
    if (snoozedUntil) {
      // When the snooze is applied, it schedules the unsnooze event to next day/week 9AM.
      // By that logic if the time difference is less than or equal to 24 + 9 hours we can consider it tomorrow.
      const MAX_TIME_DIFFERENCE = 33;
      const isSnoozedUntilTomorrow =
        differenceInHours(new Date(snoozedUntil), new Date()) <= MAX_TIME_DIFFERENCE;
      return isSnoozedUntilTomorrow
        ? i18n.t('CONVERSATION.SNOOZE_UNTIL_TOMORROW')
        : i18n.t('CONVERSATION.SNOOZE_UNTIL_NEXT_WEEK');
    }
    return i18n.t('CONVERSATION.SNOOZE_UNTIL_NEXT_REPLY');
  };

  return (
    <React.Fragment>
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

      <ConversationActionItem
        onPressItem={onPressAction}
        iconName="tag-outline"
        text={i18n.t('CONVERSATION.LABELS')}
        colors={colors}
        itemType="label"
      />

      <ConversationActionItem
        onPressItem={onPressAction}
        iconName="snooze-outline"
        text={i18n.t('CONVERSATION.SNOOZE')}
        colors={colors}
        name={isSnoozed ? snoozeDisplayText() : ''}
        itemType="snooze"
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
        iconName="book-clock-outline"
        text={i18n.t('CONVERSATION.MARK_AS_PENDING')}
        colors={colors}
        itemType="pending"
      />

      <ConversationActionItem
        onPressItem={onPressAction}
        iconName="share-outline"
        text={i18n.t('CONVERSATION.SHARE')}
        colors={colors}
        itemType="share"
      />
    </React.Fragment>
  );
};

export default ConversationActionComponent;
