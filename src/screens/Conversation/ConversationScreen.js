import React, { useMemo, useEffect, useCallback, useState, useRef } from 'react';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { View, ScrollView, AppState, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';

import { getInboxIconByType } from 'helpers/inboxHelpers';
import ActionCable from 'helpers/ActionCable';
import { getPubSubToken, getUserDetails } from 'helpers/AuthHelper';
import { clearAllDeliveredNotifications } from 'helpers/PushHelper';
import {
  selectConversationStatus,
  selectAssigneeType,
  selectActiveInbox,
  setAssigneeType,
  setConversationStatus,
  clearAllConversations,
  setActiveInbox,
  selectConversationMeta,
} from 'reducer/conversationSlice';
import conversationActions from 'reducer/conversationSlice.action';
import createStyles from './ConversationScreen.style';
import i18n from 'i18n';
import { FilterButton, ClearFilterButton, Header } from 'components';
import BottomSheetModal from 'components/BottomSheet/BottomSheet';
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
import { actions as dashboardAppActions } from 'reducer/dashboardAppSlice';
import { getCurrentRouteName } from 'helpers/NavigationHelper';
import { actions as labelActions } from 'reducer/labelSlice';
import { actions as teamActions } from 'reducer/teamSlice';
import { SCREENS } from 'constants';
const deviceHeight = Dimensions.get('window').height;

// The screen list thats need to be checked for refresh notification list
const REFRESH_SCREEN_LIST = [SCREENS.CONVERSATION, SCREENS.NOTIFICATION, SCREENS.SETTINGS];

const ConversationScreen = () => {
  const [appState, setAppState] = useState(AppState.currentState);
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
    initAnalytics();
    initSentry();
    checkAppVersion();
    initPushNotifications();
    dispatch(dashboardAppActions.index());
    dispatch(labelActions.index());
    dispatch(teamActions.index());
  }, [
    dispatch,
    initActionCable,
    initAnalytics,
    initPushNotifications,
    checkAppVersion,
    initSentry,
  ]);

  const initPushNotifications = useCallback(async () => {
    dispatch(notificationActions.index({ pageNo: 1 }));
    dispatch(notificationActions.saveDeviceDetails());
    clearAllDeliveredNotifications();
  }, [dispatch]);

  const initAnalytics = useCallback(async () => {
    AnalyticsHelper.identify(user);
  }, [user]);

  const initSentry = useCallback(async () => {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      account_id: user.account_id,
      name: user.name,
      role: user.role,
      installation_url: installationUrl,
    });
  }, [user, installationUrl]);

  const checkAppVersion = useCallback(async () => {
    dispatch(settingsActions.checkInstallationVersion({ user, installationUrl }));
  }, [dispatch, user, installationUrl]);

  const initActionCable = useCallback(async () => {
    const pubSubToken = await getPubSubToken();
    const { accountId, userId } = await getUserDetails();
    ActionCable.init({ pubSubToken, webSocketUrl, accountId, userId });
  }, [webSocketUrl]);
  // Update notifications when app comes to foreground from background
  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', nextAppState => {
      if (appState === 'background' && nextAppState === 'active') {
        const routeName = getCurrentRouteName();
        if (REFRESH_SCREEN_LIST.includes(routeName)) {
          loadConversations({
            page: pageNumber,
            assignee: assigneeType,
            status: conversationStatus,
            inboxId: activeInboxId,
          });
        }
      }
      setAppState(nextAppState);
    });
    return () => {
      appStateListener?.remove();
    };
  }, [appState, pageNumber, assigneeType, conversationStatus, activeInboxId, loadConversations]);

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

  const conversationMetaDetails = useSelector(selectConversationMeta);

  const conversationCount = () => {
    switch (assigneeType) {
      case 'mine':
        return conversationMetaDetails.mine_count;
      case 'unassigned':
        return conversationMetaDetails.unassigned_count;
      case 'all':
        return conversationMetaDetails.all_count;
      default:
        return 0;
    }
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
  const conversationFilterModalSnapPoints = useMemo(
    () => [deviceHeight - 400, deviceHeight - 400],
    [],
  );

  // Filter by assignee type
  const conversationAssigneeModal = useRef(null);
  const toggleConversationAssigneeModal = useCallback(() => {
    conversationAssigneeModal.current.present() || conversationAssigneeModal.current?.dismiss();
  }, []);
  const closeConversationAssigneeModal = useCallback(() => {
    conversationAssigneeModal.current?.dismiss();
  }, []);

  // Filter by conversation status
  const conversationStatusModal = useRef(null);
  const toggleConversationStatusModal = useCallback(() => {
    conversationStatusModal.current.present() || conversationStatusModal.current?.dismiss();
  }, []);
  const closeConversationStatusModal = useCallback(() => {
    conversationStatusModal.current?.dismiss();
  }, []);

  // Inbox filter modal
  const inboxFilterModal = useRef(null);
  const inboxFilterModalSnapPoints = useMemo(() => [deviceHeight - 210, deviceHeight - 210], []);
  const toggleInboxFilterModal = useCallback(() => {
    inboxFilterModal.current.present() || inboxFilterModal.current?.dismiss();
  }, []);
  const closeInboxFilterModal = useCallback(() => {
    inboxFilterModal.current?.dismiss();
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
      <Header headerText={headerText} loading={isLoading} showCount count={conversationCount()} />
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
          showHeader
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
          showHeader
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
          showHeader
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
