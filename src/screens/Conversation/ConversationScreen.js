import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clearAllDeliveredNotifications } from 'helpers/PushHelper';
import { useSelector, useDispatch } from 'react-redux';
import { View } from 'react-native';
import { getInboxes } from 'actions/inbox';
import { getAgents } from 'actions/agent';
import ActionCable from 'helpers/ActionCable';
import { getPubSubToken, getUserDetails } from 'helpers/AuthHelper';
import {
  actions as conversationActions,
  selectConversationStatus,
  selectAssigneeType,
  selectActiveInbox,
} from 'reducer/conversationSlice';
import { saveDeviceDetails } from 'actions/notification';
import { getInstalledVersion } from 'actions/settings';
import createStyles from './ConversationScreen.style';
import { identifyUser } from 'helpers/Analytics';
import i18n from 'i18n';
import Header from 'components/Header/Header';
import { ConversationList } from './components';

const ConversationScreen = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const conversationStatus = useSelector(selectConversationStatus);
  const assigneeType = useSelector(selectAssigneeType);
  const activeInboxId = useSelector(selectActiveInbox);
  const installationUrl = useSelector(state => state.settings.installationUrl);
  const webSocketUrl = useSelector(state => state.settings.webSocketUrl);
  const isLoading = useSelector(state => state.conversations.loading);

  const [pageNumber, setPage] = useState(1);
  const dispatch = useDispatch();

  useEffect(() => {
    clearAllDeliveredNotifications();
    initActionCable();
    dispatch(getInstalledVersion());
    dispatch(getInboxes());
    dispatch(getAgents());
    dispatch(saveDeviceDetails());
    storeUser();
  }, [dispatch, initActionCable, storeUser]);

  const initActionCable = useCallback(async () => {
    const pubSubToken = await getPubSubToken();
    const { accountId, userId } = await getUserDetails();
    ActionCable.init({ pubSubToken, webSocketUrl, accountId, userId });
  }, [webSocketUrl]);

  const onChangePage = async () => {
    setPage(pageNumber + 1);
  };

  const refreshConversations = async () => {
    setPage(1);
    loadConversations({ page: 1 });
  };

  const storeUser = useCallback(async () => {
    const { userId, email, name } = await getUserDetails();
    identifyUser({ userId, email, name, installationUrl });
  }, [installationUrl]);

  useEffect(() => {
    loadConversations({
      page: pageNumber,
      assignee: assigneeType,
      status: conversationStatus,
      inboxId: activeInboxId,
    });
  }, [pageNumber, assigneeType, conversationStatus, activeInboxId, loadConversations]);

  const loadConversations = useCallback(
    ({ page, assignee, status, inboxId }) => {
      dispatch(
        conversationActions.fetchConversations({
          pageNumber: page,
          assigneeType: assignee,
          conversationStatus: status,
          inboxId: inboxId,
        }),
      );
    },
    [dispatch],
  );

  const headerText = isLoading
    ? i18n.t('CONVERSATION.UPDATING')
    : i18n.t('CONVERSATION.DEFAULT_HEADER_TITLE');

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <Header headerText={headerText} />
      <View style={styles.container}>
        <ConversationList
          onChangePageNumber={onChangePage}
          refreshConversations={refreshConversations}
          assigneeType={assigneeType}
          conversationStatus={conversationStatus}
          activeInboxId={activeInboxId}
          isCountEnabled
        />
      </View>
    </SafeAreaView>
  );
};

export default ConversationScreen;
