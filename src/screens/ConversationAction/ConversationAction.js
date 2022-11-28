/* eslint-disable react/prop-types */
import React from 'react';
import { withStyles } from '@ui-kitten/components';
import { getConversationUrl } from 'src/helpers/UrlHelper';
import { Share } from 'react-native';
import { useSelector } from 'react-redux';
import styles from './ConversationAction.style';
import ConversationActionItem from '../../components/ConversationActionItem';
import i18n from '../../i18n';

const ConversationActionComponent = ({ eva: { style }, onPressAction, conversationDetails }) => {
  const agents = useSelector(state => state.agent.data);

  const {
    meta: { assignee, team },
  } = conversationDetails;

  let assignedAgent = null;
  if (assignee) {
    assignedAgent = agents.find(item => item.id === assignee.id);
  } else {
    assignedAgent = {
      name: 'Select Agent',
      thumbnail: '',
    };
  }
  const onShare = async () => {
    const { id, account_id } = conversationDetails;
    try {
      const conversationURL = await getConversationUrl({
        conversationId: id,
        accountId: account_id,
      });

      await Share.share({
        url: conversationURL,
      });
    } catch (error) {
      //error
    }
  };

  const { muted } = conversationDetails;

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
        text="Team"
        itemType="team"
        name={team ? team.name : 'Select Team'}
      />

      <ConversationActionItem
        onPressItem={onPressAction}
        text={i18n.t('CONVERSATION_LABELS.TITLE')}
        itemType="label"
      />

      {!muted ? (
        <ConversationActionItem
          onPressItem={onPressAction}
          text={i18n.t('CONVERSATION.MUTE_CONVERSATION')}
          itemType="mute_conversation"
        />
      ) : (
        <ConversationActionItem
          onPressItem={onPressAction}
          text={i18n.t('CONVERSATION.UNMUTE_CONVERSATION')}
          itemType="unmute_conversation"
        />
      )}

      <ConversationActionItem
        onPressItem={onShare}
        text={i18n.t('CONVERSATION.SHARE')}
        itemType="share"
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
