import React, { useMemo, useEffect, useCallback, useState, useRef } from 'react';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clearAllDeliveredNotifications } from 'helpers/PushHelper';
import { useSelector, useDispatch } from 'react-redux';
import { View, ScrollView } from 'react-native';
import BottomSheetModal from 'components/BottomSheet/BottomSheet';
import { useFocusEffect } from '@react-navigation/native';
import { getInboxIconByType } from 'helpers/inboxHelpers';
import ActionCable from 'helpers/ActionCable';
import { getPubSubToken, getUserDetails } from 'helpers/AuthHelper';
import {
  selectConversationStatus,
  selectAssigneeType,
  selectActiveInbox,
  setAssigneeType,
  setConversationStatus,
  clearAllConversations,
  setActiveInbox,
} from 'reducer/conversationSlice';
import conversationActions from 'reducer/conversationSlice.action';
import createStyles from './ConversationScreen.style';
import i18n from 'i18n';
import { FilterButton, ClearFilterButton, Header } from 'components';
import { ConversationList, ConversationFilter, ConversationInboxFilter } from './components';
import { CONVERSATION_STATUSES, ASSIGNEE_TYPES } from 'constants';
import AnalyticsHelper from 'helpers/AnalyticsHelper';
import { CONVERSATION_EVENTS } from 'constants/analyticsEvents';
import { actions as inboxActions, inboxesSelector } from 'reducer/inboxSlice';
import { selectUser } from 'reducer/authSlice';
import {
  selectWebSocketUrl,
  selectInstallationUrl,
  actions as settingsActions,
} from 'reducer/settingsSlice';
import { actions as notificationActions } from 'reducer/notificationSlice';

const ConversationScreen = () => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const conversationStatus = useSelector(selectConversationStatus);
  const assigneeType = useSelector(selectAssigneeType);
  const activeInboxId = useSelector(selectActiveInbox);
  const webSocketUrl = useSelector(selectWebSocketUrl);
  const installationUrl = useSelector(selectInstallationUrl);
  const isLoading = useSelector(state => state.conversations.loading);
  const inboxes = useSelector(inboxesSelector.selectAll);
  const user = useSelector(selectUser);

  const [pageNumber, setPage] = useState(1);
  const dispatch = useDispatch();

  useEffect(() => {
    initActionCable();
    dispatch(clearAllConversations());
    dispatch(inboxActions.fetchInboxes());
    dispatch(notificationActions.index({ pageNo: 1 }));
    initAnalytics();
    checkAppVersion();
    initPushNotifications();
  }, [dispatch, initActionCable, initAnalytics, initPushNotifications, checkAppVersion]);

  const initPushNotifications = useCallback(async () => {
    dispatch(notificationActions.saveDeviceDetails());
    clearAllDeliveredNotifications();
  }, [dispatch]);

  const initAnalytics = useCallback(async () => {
    AnalyticsHelper.identify(user);
  }, [user]);

  const checkAppVersion = useCallback(async () => {
    dispatch(settingsActions.checkInstallationVersion({ user, installationUrl }));
  }, [dispatch, user, installationUrl]);

  const initActionCable = useCallback(async () => {
    const pubSubToken = await getPubSubToken();
    const { accountId, userId } = await getUserDetails();
    ActionCable.init({ pubSubToken, webSocketUrl, accountId, userId });
  }, [webSocketUrl]);

  const onChangePage = async () => {
    setPage(pageNumber + 1);
  };

  const refreshConversations = async () => {
    AnalyticsHelper.track(CONVERSATION_EVENTS.REFRESH_CONVERSATIONS);
    await dispatch(clearAllConversations());
    setPage(1);
    loadConversations({
      page: 1,
      assignee: assigneeType,
      status: conversationStatus,
      inboxId: activeInboxId,
    });
  };

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

  const clearAppliedFilters = async () => {
    AnalyticsHelper.track(CONVERSATION_EVENTS.CLEAR_FILTERS);
    await dispatch(clearAllConversations());
    await dispatch(setConversationStatus('open'));
    await dispatch(setAssigneeType('mine'));
    await dispatch(setActiveInbox(0));
    setPage(1);
  };

  const onSelectAssigneeType = async item => {
    AnalyticsHelper.track(CONVERSATION_EVENTS.APPLY_FILTER, {
      type: 'assignee-type',
      value: item.key,
    });
    await dispatch(setAssigneeType(item.key));
    setPage(1);
    closeConversationAssigneeModal();
  };

  const onSelectConversationStatus = async item => {
    AnalyticsHelper.track(CONVERSATION_EVENTS.APPLY_FILTER, {
      type: 'status',
      value: item.key,
    });
    await dispatch(clearAllConversations());
    await dispatch(setConversationStatus(item.key));
    setPage(1);
    closeConversationStatusModal();
  };

  const onChangeInbox = async item => {
    AnalyticsHelper.track(CONVERSATION_EVENTS.APPLY_FILTER, {
      type: 'inbox',
    });
    await dispatch(clearAllConversations());
    await dispatch(setActiveInbox(item.id));
    setPage(1);
    closeInboxFilterModal();
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        closeInboxFilterModal();
        closeConversationStatusModal();
        closeConversationAssigneeModal();
      };
    }, [closeConversationAssigneeModal, closeConversationStatusModal, closeInboxFilterModal]),
  );

  // Conversation filter modal
  const conversationFilterModalSnapPoints = useMemo(() => ['40%', '60%', '60%'], []);

  // Filter by assignee type
  const conversationAssigneeModal = useRef(null);
  const toggleConversationAssigneeModal = useCallback(() => {
    conversationAssigneeModal.current.present() || conversationAssigneeModal.current?.close();
  }, []);
  const closeConversationAssigneeModal = useCallback(() => {
    conversationAssigneeModal.current?.close();
  }, []);

  // Filter by conversation status
  const conversationStatusModal = useRef(null);
  const toggleConversationStatusModal = useCallback(() => {
    conversationStatusModal.current.present() || conversationStatusModal.current?.close();
  }, []);
  const closeConversationStatusModal = useCallback(() => {
    conversationStatusModal.current?.close();
  }, []);

  // Inbox filter modal
  const inboxFilterModal = useRef(null);
  const inboxFilterModalSnapPoints = useMemo(() => ['40%', '80%', '92%'], []);
  const toggleInboxFilterModal = useCallback(() => {
    inboxFilterModal.current.present() || inboxFilterModal.current?.close();
  }, []);
  const closeInboxFilterModal = useCallback(() => {
    inboxFilterModal.current?.close();
  }, []);

  const hasActiveFilters =
    conversationStatus !== 'open' || assigneeType !== 'mine' || activeInboxId !== 0;

  const filtersCount =
    Number(conversationStatus !== 'open') +
    Number(assigneeType !== 'mine') +
    Number(activeInboxId !== 0);

  const activeInboxDetails = inboxes.find(inbox => inbox.id === activeInboxId);
  const iconNameByInboxType = () => {
    if (!activeInboxId) {
      return 'chat-outline';
    }
    const { channel_type: channelType, phone_number: phoneNumber } = activeInboxDetails;
    if (!channelType) {
      return '';
    }
    return getInboxIconByType({ channelType, phoneNumber });
  };

  const inboxName =
    activeInboxDetails?.name === 'All'
      ? i18n.t('FILTER.ALL_INBOXES')
      : activeInboxDetails?.name || i18n.t('FILTER.ALL_INBOXES');

  const headerText = isLoading
    ? i18n.t('CONVERSATION.UPDATING')
    : i18n.t('CONVERSATION.DEFAULT_HEADER_TITLE');

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <Header headerText={headerText} loading={isLoading} />
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {hasActiveFilters && (
            <ClearFilterButton count={filtersCount} onSelectItem={clearAppliedFilters} />
          )}
          <FilterButton
            label={ASSIGNEE_TYPES.map(item => (item.key === assigneeType ? item.name : null))}
            hasLeftIcon={false}
            onPress={toggleConversationAssigneeModal}
            isActive={assigneeType !== 'mine'}
          />
          <FilterButton
            label={CONVERSATION_STATUSES.map(item =>
              item.key === conversationStatus ? item.name : null,
            )}
            hasLeftIcon={false}
            onPress={toggleConversationStatusModal}
            isActive={conversationStatus !== 'open'}
          />
          <FilterButton
            label={inboxName}
            hasLeftIcon={true}
            leftIconName={iconNameByInboxType()}
            onPress={toggleInboxFilterModal}
            isActive={activeInboxId !== 0}
          />
        </ScrollView>
        <BottomSheetModal
          bottomSheetModalRef={conversationAssigneeModal}
          initialSnapPoints={conversationFilterModalSnapPoints}
          headerTitle={i18n.t('FILTER.FILTER_BY_ASSIGNEE_TYPE')}
          closeFilter={closeConversationAssigneeModal}
          children={
            <ConversationFilter
              activeValue={assigneeType}
              items={ASSIGNEE_TYPES}
              onChangeFilter={onSelectAssigneeType}
              colors={colors}
            />
          }
        />
        <BottomSheetModal
          bottomSheetModalRef={conversationStatusModal}
          initialSnapPoints={conversationFilterModalSnapPoints}
          headerTitle={i18n.t('FILTER.FILTER_BY_CONVERSATION_STATUS')}
          closeFilter={closeConversationStatusModal}
          children={
            <ConversationFilter
              activeValue={conversationStatus}
              items={CONVERSATION_STATUSES}
              onChangeFilter={onSelectConversationStatus}
              colors={colors}
            />
          }
        />
        <BottomSheetModal
          bottomSheetModalRef={inboxFilterModal}
          initialSnapPoints={inboxFilterModalSnapPoints}
          headerTitle={i18n.t('FILTER.FILTER_BY_INBOX')}
          closeFilter={closeInboxFilterModal}
          children={
            <ConversationInboxFilter
              activeValue={activeInboxId}
              hasLeftIcon={true}
              items={inboxes}
              onChangeFilter={onChangeInbox}
              colors={colors}
            />
          }
        />
      </View>
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
