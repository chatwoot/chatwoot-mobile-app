/* eslint-disable react/prop-types */
import React from 'react';
import { withStyles } from '@ui-kitten/components';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native';

import HeaderBar from '../../components/HeaderBar';
import i18n from '../../i18n';
import styles from './ConversationAction.style';
import ConversationActionItem from '../../components/ConversationActionItem';

const ConversationActionComponent = ({ eva: { style }, navigation, route }) => {
  const { conversationDetails } = route.params;
  const agents = useSelector((state) => state.agent.data);
  const {
    meta: { assignee },
  } = conversationDetails;
  const goBack = () => {
    navigation.goBack();
  };

  const onPressItem = () => {
    navigation.navigate('AgentScreen', { conversationDetails });
  };

  const assignedAgent = agents.find((item) => item.id === assignee.id);

  return (
    <SafeAreaView style={style.container}>
      <HeaderBar title={i18n.t('CONVERSATION_ACTION.TITLE')} showLeftButton onBackPress={goBack} />
      <ConversationActionItem
        onPressItem={onPressItem}
        text="Assignee"
        itemType="assignee"
        name={assignedAgent.name}
        thumbnail={assignedAgent.thumbnail}
        availabilityStatus={assignedAgent.availability_status}
      />
    </SafeAreaView>
  );
};

const ConversationAction = withStyles(ConversationActionComponent, styles);
export default ConversationAction;
