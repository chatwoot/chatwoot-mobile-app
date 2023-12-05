import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { TabView, TabBar } from 'react-native-tab-view';
import PropTypes from 'prop-types';
import { SafeAreaView, AppState, useWindowDimensions, Keyboard } from 'react-native';
import { StackActions } from '@react-navigation/native';

import createStyles from './ChatScreen.style';
import ChatHeader from './components/ChatHeader';
import ChatHeaderLoader from './components/ChatHeaderLoader';
import DashboardApp from './components/DashboardApp';
import MessageList from './components/MessageList/MessageList';

import { selectUser } from 'reducer/authSlice';
import { actions as notificationsActions } from 'reducer/notificationSlice';
import { dashboardAppSelector } from 'reducer/dashboardAppSlice';
import { selectAllTypingUsers } from 'reducer/conversationTypingSlice';
import { selectors as conversationSelectors } from 'reducer/conversationSlice.selector.js';
import conversationActions from 'reducer/conversationSlice.action';
import { getCurrentRouteName } from 'helpers/NavigationHelper';

import { SCREENS } from 'constants';
import i18n from 'i18n';

const propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    canGoBack: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
  }).isRequired,
};

const ChatScreenComponent = ({ navigation, route }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const conversationTypingUsers = useSelector(selectAllTypingUsers);
  const [appState, setAppState] = useState(AppState.currentState);

  const { conversationId, primaryActorId, primaryActorType } = route.params;

  const conversation = useSelector(state =>
    conversationSelectors.getConversationById(state, conversationId),
  );

  const allMessages = useSelector(state =>
    conversationSelectors.getMessagesByConversationId(state, conversationId),
  );

  const currentUser = useSelector(selectUser);

  const dashboardApps = useSelector(dashboardAppSelector.selectAll);
  const isDashboardAppsEmpty = dashboardApps?.length === 0;
  const dashboardRoutes = [];
  if (!isDashboardAppsEmpty) {
    dashboardApps.forEach(element => {
      dashboardRoutes.push({
        key: element.id,
        title: element.title,
        route: 'DashboardRoute',
        content: element.content,
        conversation: conversation,
        currentUser: currentUser,
      });
    });
  }

  const [routes] = React.useState([
    { key: 'MessageRoute', title: i18n.t('CONVERSATION.MESSAGES'), route: 'MessageRoute' },
    ...dashboardRoutes,
  ]);

  const { meta: conversationMetaDetails = {} } = conversation || {};

  const lastMessageId = useCallback(() => {
    let beforeId = null;
    if (allMessages && allMessages.length) {
      const lastMessage = allMessages[allMessages.length - 1];
      const { id } = lastMessage;
      beforeId = id;
    }
    return beforeId;
  }, [allMessages]);

  useEffect(() => {
    dispatch(conversationActions.markMessagesAsRead({ conversationId }));
  }, [dispatch, conversationId]);

  useEffect(() => {
    if (primaryActorId && primaryActorType) {
      dispatch(
        notificationsActions.markNotificationAsRead({
          primaryActorId,
          primaryActorType,
        }),
      );
    }
  }, [conversationId, dispatch, primaryActorId, primaryActorType]);

  useEffect(() => {
    loadMessages({ loadingMessagesForFirstTime: true });
  }, [loadMessages]);

  const loadMessages = useCallback(
    async ({ loadingMessagesForFirstTime = false }) => {
      const beforeId = loadingMessagesForFirstTime ? null : lastMessageId();
      // Fetch conversation if not present and fetch previous messages, otherwise fetch previous messages
      if (!conversation) {
        await dispatch(conversationActions.fetchConversation({ conversationId }));
        dispatch(
          conversationActions.fetchPreviousMessages({
            conversationId,
            beforeId,
          }),
        );
      } else {
        dispatch(
          conversationActions.fetchPreviousMessages({
            conversationId,
            beforeId,
          }),
        );
      }
    },
    [conversation, conversationId, dispatch, lastMessageId],
  );

  const onBackPress = () => {
    Keyboard.dismiss();
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.dispatch(StackActions.replace('Tab'));
    }
  };

  // Update messages list when app comes to foreground from background
  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        const routeName = getCurrentRouteName();
        if (routeName === SCREENS.CHAT) {
          dispatch(
            conversationActions.fetchPreviousMessages({
              conversationId,
            }),
          );
          dispatch(
            conversationActions.updateConversation({
              conversationId,
            }),
          );
        }
      }
      setAppState(nextAppState);
    });
    return () => {
      appStateListener?.remove();
    };
  }, [appState, conversationId, dispatch]);

  const showConversationDetails = () => {
    if (conversation) {
      navigation.navigate('ConversationDetails', { conversationDetails: conversation });
    }
  };

  const dashboardScenes = {
    MessageRoute: () => <MessageList loadMessages={loadMessages} conversationId={conversationId} />,
  };
  if (!isDashboardAppsEmpty) {
    dashboardRoutes.forEach(item => {
      dashboardScenes[item.key] = DashboardApp;
    });
  }

  const renderScene = ({ route: tabRoute }) => {
    if (tabRoute.route === 'MessageRoute') {
      return <MessageList loadMessages={loadMessages} conversationId={conversationId} />;
    }
    if (tabRoute.route === 'DashboardRoute') {
      return (
        <DashboardApp
          content={tabRoute.content}
          conversation={tabRoute.conversation}
          currentUser={tabRoute.currentUser}
        />
      );
    }
    return null;
  };

  const renderTabBar = props => (
    <TabBar
      {...props}
      labelStyle={styles.tabLabel}
      activeColor="#1F93FF"
      inactiveColor="#8492a6"
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      tabStyle={styles.tabStyle}
      scrollEnabled={true}
    />
  );

  return (
    <SafeAreaView style={styles.mainContainer}>
      {conversation ? (
        <ChatHeader
          conversationId={conversationId}
          conversationTypingUsers={conversationTypingUsers}
          conversationDetails={conversation}
          conversationMetaDetails={conversationMetaDetails}
          showConversationDetails={showConversationDetails}
          hasDashboardApps={!isDashboardAppsEmpty}
          onBackPress={onBackPress}
        />
      ) : (
        <ChatHeaderLoader />
      )}
      {isDashboardAppsEmpty ? (
        <MessageList loadMessages={loadMessages} conversationId={conversationId} />
      ) : (
        <TabView
          renderTabBar={renderTabBar}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
        />
      )}
    </SafeAreaView>
  );
};

ChatScreenComponent.propTypes = propTypes;
export default ChatScreenComponent;
