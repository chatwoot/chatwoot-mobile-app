import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import i18n from 'i18n';
import { CONVERSATION_EVENTS } from 'constants/analyticsEvents';
import AnalyticsHelper from 'helpers/AnalyticsHelper';
import conversationActions from 'reducer/conversationSlice.action';
import ConversationAgentItems from 'components/ConversationAgentItem';
import { inboxAgentSelectors } from 'reducer/inboxAgentsSlice';

const propTypes = {
  colors: PropTypes.object,
  conversationDetails: PropTypes.object,
  closeModal: PropTypes.func,
};

const AssignAgent = ({ colors, conversationDetails, closeModal }) => {
  const {
    id: conversationId,
    meta: { assignee },
  } = conversationDetails;

  const dispatch = useDispatch();

  const [assigneeId, setAssignee] = useState(assignee ? assignee.id : null);

  const activeAssigneeId = assigneeId ? [assigneeId] : [0];

  const agents = useSelector(state => inboxAgentSelectors.inboxAssignedAgents(state));

  const isAgentSelected = assigneeId !== null;

  const agentsList = () => {
    return [
      ...(isAgentSelected
        ? [
            {
              confirmed: true,
              name: 'None',
              id: 0,
              role: 'agent',
              account_id: 0,
              email: 'None',
            },
          ]
        : []),
      ...agents,
    ];
  };

  const updateAssignee = agent => {
    const id = agent.id;
    setAssignee(id);
    if (!assignee || assignee.id !== id) {
      AnalyticsHelper.track(CONVERSATION_EVENTS.ASSIGNEE_CHANGED);
      dispatch(
        conversationActions.assignConversation({
          conversationId: conversationId,
          assigneeId: id,
        }),
      );
    }
    closeModal();
  };
  return (
    <ConversationAgentItems
      colors={colors}
      title={i18n.t('CONVERSATION_AGENTS.SELECT_AGENT')}
      agentsList={agentsList()}
      activeValue={activeAssigneeId}
      onClick={updateAssignee}
    />
  );
};

AssignAgent.propTypes = propTypes;
export default AssignAgent;
