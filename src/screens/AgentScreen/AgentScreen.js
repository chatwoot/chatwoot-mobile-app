/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { withStyles } from '@ui-kitten/components';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView, View } from 'react-native';

import LoaderButton from '../../components/LoaderButton';
import HeaderBar from '../../components/HeaderBar';
import i18n from '../../i18n';
import styles from './AgentScreen.style';
import AgentItem from '../../components/AgentItem';
import { assignConversation } from '../../actions/conversation';

const AgentScreenComponent = ({ eva: { style }, navigation, route }) => {
  const dispatch = useDispatch();
  const { conversationDetails } = route.params;
  const {
    meta: { assignee },
  } = conversationDetails;
  const [assigneeId, setAssignee] = useState(assignee.id);
  const agents = useSelector((state) => state.agent.data);
  const conversation = useSelector((state) => state.conversation);
  const { isAssigneeUpdating } = conversation;

  const goBack = () => {
    navigation.goBack();
  };

  const onCheckedChange = (item) => {
    setAssignee(item.id);
  };
  const updateAssignee = () => {
    if (assignee.id !== assigneeId) {
      dispatch(
        assignConversation({
          conversationId: conversationDetails.id,
          assigneeId: assigneeId,
        }),
      );
    }
  };

  return (
    <SafeAreaView style={style.container}>
      <HeaderBar title={i18n.t('AGENT.TITLE')} showLeftButton onBackPress={goBack} />
      {agents.map((item) => (
        <AgentItem
          name={item.name}
          thumbnail={item.thumbnail}
          availabilityStatus={item.availability_status}
          key={item.id}
          assigned={item.id === assigneeId}
          onCheckedChange={() => onCheckedChange(item)}
        />
      ))}
      <View style={style.submitButtonView}>
        <LoaderButton
          style={style.submitButton}
          size="large"
          textStyle={style.submitButtonText}
          onPress={() => updateAssignee()}
          text={i18n.t('SETTINGS.SUBMIT')}
          loading={isAssigneeUpdating}
        />
      </View>
    </SafeAreaView>
  );
};

const AgentScreen = withStyles(AgentScreenComponent, styles);
export default AgentScreen;
