/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Spinner, withStyles } from '@ui-kitten/components';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView, View, ScrollView } from 'react-native';

import LoaderButton from '../../components/LoaderButton';
import HeaderBar from '../../components/HeaderBar';
import i18n from '../../i18n';
import styles from './AgentScreen.style';
import AgentItem from '../../components/AgentItem';
import conversationActions from 'reducer/conversationSlice.action';
import { selectConversationAssigneeStatus } from 'reducer/conversationSlice';
import {
  actions as inboxAgentActions,
  selectInboxFetching,
  inboxAgentSelectors,
} from 'reducer/inboxAgentsSlice';
import { useEffect } from 'react';
import { CONVERSATION_EVENTS } from 'constants/analyticsEvents';
import AnalyticsHelper from 'helpers/AnalyticsHelper';

const AgentScreenComponent = ({ eva: { style }, navigation, route }) => {
  const dispatch = useDispatch();
  const { conversationDetails } = route.params;
  const {
    meta: { assignee },
    inbox_id: inboxId,
  } = conversationDetails;

  const [assigneeId, setAssignee] = useState(assignee ? assignee.id : null);
  const isInboxAgentsFetching = useSelector(selectInboxFetching);
  const isAssigneeUpdating = useSelector(selectConversationAssigneeStatus);

  const agents = useSelector(state => inboxAgentSelectors.inboxAssignedAgents(state));

  const goBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    dispatch(inboxAgentActions.fetchInboxAgents({ inboxId }));
  }, [dispatch, inboxId]);

  const onCheckedChange = item => {
    setAssignee(item.id);
  };
  const updateAssignee = () => {
    if (!assignee || assignee.id !== assigneeId) {
      AnalyticsHelper.track(CONVERSATION_EVENTS.ASSIGNEE_CHANGED);
      dispatch(
        conversationActions.assignConversation({
          conversationId: conversationDetails.id,
          assigneeId,
        }),
      );
      navigation.goBack();
    } else {
      navigation.goBack();
    }
  };
  return (
    <SafeAreaView style={style.container}>
      <HeaderBar title={i18n.t('AGENT.TITLE')} showLeftButton onBackPress={goBack} />

      {!isInboxAgentsFetching ? (
        <ScrollView>
          {agents.map(item => (
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
        </ScrollView>
      ) : (
        <View style={style.spinnerView}>
          <Spinner size="medium" />
        </View>
      )}
    </SafeAreaView>
  );
};

const AgentScreen = withStyles(AgentScreenComponent, styles);
export default AgentScreen;
