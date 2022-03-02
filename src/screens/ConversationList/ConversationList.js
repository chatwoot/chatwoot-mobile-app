import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Tab, TabView, withStyles } from '@ui-kitten/components';
import { SafeAreaView, View } from 'react-native';
import PropTypes from 'prop-types';

import { getInboxes } from 'actions/inbox';
import { getAgents } from 'actions/agent';
import { getConversations, setAssigneeType } from 'actions/conversation';
import { getInstalledVersion } from 'actions/settings';
import { saveDeviceDetails } from 'actions/notification';
import { getAllNotifications } from 'actions/notification';
import ConversationEmptyList from './components/ConversationEmptyList';
import ConversationItems from './components/ConversationItems';
import ConversationEmptyMessage from './components/ConversationEmptyMessage';
import styles from './ConversationList.style';
import i18n from 'i18n';
import ActionCable from 'helpers/ActionCable';
import { getPubSubToken, getUserDetails } from 'helpers/AuthHelper';
import HeaderBar from 'components/HeaderBar';
import { clearAllDeliveredNotifications } from 'helpers/PushHelper';
import { identifyUser, captureEvent } from 'helpers/Analytics';
const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
  }).isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

const ConversationList = ({ eva: { style }, navigation }) => {
  const dispatch = useDispatch();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const webSocketUrl = useSelector(state => state.settings.webSocketUrl);
  const installationUrl = useSelector(state => state.settings.installationUrl);
  const isFetching = useSelector(state => state.conversation.isFetching);
  const conversations = useSelector(state => state.conversation.data);
  const conversationStatus = useSelector(state => state.conversation.conversationStatus);
  const inboxSelected = useSelector(state => state.inbox.inboxSelected);

  useEffect(() => {
    clearAllDeliveredNotifications();
    initActionCable();
    dispatch(getInstalledVersion());
    dispatch(getInboxes());
    dispatch(getAgents());
    dispatch(saveDeviceDetails());
    storeUser();
  }, [dispatch, initActionCable, storeUser]);

  useEffect(() => {
    loadConversations();
    dispatch(getAllNotifications({ pageNo: 1 }));
  }, [dispatch, initActionCable, loadConversations]);

  const loadConversations = useCallback(() => {
    dispatch(
      getConversations({
        assigneeType: selectedIndex,
        pageNumber,
      }),
    );
  }, [dispatch, selectedIndex, pageNumber]);

  const initActionCable = useCallback(async () => {
    const pubSubToken = await getPubSubToken();
    const { accountId, userId } = await getUserDetails();
    ActionCable.init({ pubSubToken, webSocketUrl, accountId, userId });
  }, [webSocketUrl]);

  const storeUser = useCallback(async () => {
    const { userId, email, name } = await getUserDetails();
    identifyUser({ userId, email, name, installationUrl });
  }, [installationUrl]);

  const openFilter = () => {
    captureEvent({ eventName: 'Open conversation filter menu' });
    navigation.navigate('ConversationFilter', {
      assigneeType: selectedIndex,
      inboxSelected,
    });
  };

  const onChangeTab = async index => {
    const tabName = index === 0 ? 'Mine' : index === 1 ? 'UnAssigned' : 'All';
    captureEvent({ eventName: `Conversation tab ${tabName} clicked` });
    setSelectedIndex(index);
    setPageNumber(1);
    dispatch(setAssigneeType({ assigneeType: index }));
  };

  React.useEffect(() => {
    loadConversations(pageNumber);
  }, [loadConversations, pageNumber]);
  const { payload, meta } = conversations;
  // eslint-disable-next-line react/prop-types
  const renderTab = ({ tabIndex, tabTitle }) => {
    return (
      <Tab
        title={tabTitle}
        titleStyle={selectedIndex === tabIndex ? style.tabActiveTitle : style.tabNotActiveTitle}>
        <View style={style.tabView}>
          {!isFetching || payload.length ? (
            <React.Fragment>
              {payload && payload.length ? (
                <ConversationItems
                  payload={payload}
                  isFetching={isFetching}
                  loadConversations={loadConversations}
                  onChangePageNumber={() => setPageNumber(pageNumber + 1)}
                  navigation={navigation}
                />
              ) : (
                <ConversationEmptyMessage />
              )}
            </React.Fragment>
          ) : (
            <ConversationEmptyList />
          )}
        </View>
      </Tab>
    );
  };
  const { name: inBoxName } = inboxSelected;
  const mineCount = meta ? `(${meta.mine_count})` : '';
  const unAssignedCount = meta ? `(${meta.unassigned_count})` : '';
  const allCount = meta ? `(${meta.all_count})` : '';

  const headerTitle = inBoxName ? `${inBoxName} (${conversationStatus})` : '';
  return (
    <SafeAreaView style={style.container}>
      <HeaderBar title={headerTitle} showRightButton onRightPress={openFilter} buttonType="menu" />

      <TabView
        selectedIndex={selectedIndex}
        indicatorStyle={style.tabViewIndicator}
        onSelect={onChangeTab}>
        {renderTab({
          tabIndex: 0,
          tabTitle: `${i18n.t('CONVERSATION.MINE')} ${mineCount}`,
          payload,
        })}
        {renderTab({
          tabIndex: 1,
          tabTitle: `${i18n.t('CONVERSATION.UN_ASSIGNED')} ${unAssignedCount}`,
          payload,
        })}
        {renderTab({
          tabIndex: 2,
          selectedIndex,
          tabTitle: `${i18n.t('CONVERSATION.ALL')} ${allCount}`,
          payload,
        })}
      </TabView>
    </SafeAreaView>
  );
};

ConversationList.propTypes = propTypes;

const ConversationListScreen = withStyles(ConversationList, styles);
export default ConversationListScreen;
