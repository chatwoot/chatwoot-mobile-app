/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { withStyles } from '@ui-kitten/components';
import { useSelector } from 'react-redux';
import styles from './ConversationAction.style';
import ConversationActionItem from '../../components/ConversationActionItem';
import i18n from '../../i18n';
import { CONVERSATION_TOGGLE_STATUS } from '../../constants';

const ConversationActionComponent = ({ eva: { style }, onPressAction, conversationDetails }) => {
  const agents = useSelector((state) => state.agent.data);
  const [conversationStatus, setConversationStatus] = useState(null);
  useEffect(() => {
    setConversationStatus(conversationDetails.status);
  }, [conversationDetails]);
  const {
    meta: { assignee },
  } = conversationDetails;

  let assignedAgent = null;
  if (assignee) {
    assignedAgent = agents.find((item) => item.id === assignee.id);
  } else {
    assignedAgent = {
      name: 'Select Agent',
      thumbnail: '',
    };
  }

  return (
    <React.Fragment>
      <ConversationActionItem
        onPressItem={onPressAction}
        text="Assignee"
        itemType="assignee"
        name={assignedAgent.name}
        thumbnail={assignedAgent.thumbnail}
        availabilityStatus={assignedAgent.availability_status}
      />
      {assignee && (
        <ConversationActionItem
          onPressItem={onPressAction}
          text={i18n.t('CONVERSATION.UN_ASSIGN')}
          itemType="unassign"
        />
      )}
      <ConversationActionItem
        onPressItem={onPressAction}
        text={i18n.t(`CONVERSATION.${CONVERSATION_TOGGLE_STATUS[conversationStatus]}`)}
        itemType="toggle_status"
      />

      <ConversationActionItem
        onPressItem={onPressAction}
        text={i18n.t('CONVERSATION.CANCEL')}
        itemType="cancel"
      />
    </React.Fragment>
  );
};

const ConversationAction = withStyles(ConversationActionComponent, styles);
export default ConversationAction;
