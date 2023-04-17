import React, { useEffect, useCallback, useState } from 'react';
import { withStyles } from '@ui-kitten/components';
import { useSelector, useDispatch } from 'react-redux';
import { TabView, TabBar } from 'react-native-tab-view';
import PropTypes from 'prop-types';
import { SafeAreaView, AppState, useWindowDimensions } from 'react-native';
import { StackActions } from '@react-navigation/native';
import ChatHeader from './components/ChatHeader';
import ChatHeaderLoader from './components/ChatHeaderLoader';
import styles from './ChatScreen.style';
import { actions as notificationsActions } from 'reducer/notificationSlice';
import { selectUser } from 'reducer/authSlice';
import { actions as CannedResponseActions } from 'reducer/cannedResponseSlice';
import { dashboardAppSelector } from 'reducer/dashboardAppSlice';
import DashboardApp from './components/DashboardApp';
import { selectAllTypingUsers } from 'reducer/conversationTypingSlice';
import { clearConversation, selectors as conversationSelectors } from 'reducer/conversationSlice';
import conversationActions from 'reducer/conversationSlice.action';
import { getCurrentRouteName } from 'helpers/NavigationHelper';
import MessageList from './components/MessageList/MessageList';
import { SCREENS } from 'constants';
import i18n from 'i18n';
const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  route: PropTypes.object,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    canGoBack: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
  }).isRequired,
};

const ChatScreenComponent = ({ eva: { style }, navigation, route }) => {
  const dispatch = useDispatch();
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const conversationTypingUsers = useSelector(selectAllTypingUsers);
  const [appState, setAppState] = useState(AppState.currentState);

  const {
    conversationId,
    primaryActorId,
    primaryActorType,
    isConversationOpenedExternally = true,
  } = route.params;

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
      const [lastMessage] = allMessages;
      const { id } = lastMessage;
      beforeId = id;
    }
    return beforeId;
  }, [allMessages]);

  useEffect(() => {
    dispatch(CannedResponseActions.index());
    dispatch(conversationActions.markMessagesAsRead({ conversationId }));
  }, [dispatch, conversationId]);

  useEffect(() => {
    if (isConversationOpenedExternally) {
      dispatch(clearConversation(conversationId));
      loadConversation();
    } else {
      loadMessages();
    }
  }, [conversationId, isConversationOpenedExternally, loadConversation, loadMessages, dispatch]);

  const loadConversation = useCallback(() => {
    dispatch(conversationActions.fetchConversation({ conversationId }));
  }, [conversationId, dispatch]);

  const loadMessages = useCallback(async () => {
    // Fetch conversation if not present
    if (!conversation) {
      loadConversation();
    } else {
      dispatch(
        conversationActions.fetchPreviousMessages({
          conversationId,
          beforeId: lastMessageId(),
        }),
      );
    }
  }, [conversation, conversationId, dispatch, lastMessageId, loadConversation]);

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

  const onBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.dispatch(StackActions.replace('Tab'));
    }
  };

  // Update messages list when app comes to foreground from background
  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', nextAppState => {
      if (appState === 'background' && nextAppState === 'active') {
        const routeName = getCurrentRouteName();
        if (routeName === SCREENS.CHAT) {
          dispatch(conversationActions.updateConversationAndMessages({ conversationId }));
        }
      }
      setAppState(nextAppState);
    });
    return () => {
      appStateListener?.remove();
    };
  }, [appState, loadConversation, conversationId, dispatch]);

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
      labelStyle={style.tabLabel}
      activeColor="#1F93FF"
      inactiveColor="#8492a6"
      indicatorStyle={style.tabIndicator}
      style={style.tabBar}
      tabStyle={style.tabStyle}
      scrollEnabled={true}
    />
  );

  return (
    <SafeAreaView style={style.mainContainer}>
      {conversation ? (
        <ChatHeader
          conversationId={conversationId}
          conversationTypingUsers={conversationTypingUsers}
          conversationDetails={conversation}
          conversationMetaDetails={conversationMetaDetails}
          showConversationDetails={showConversationDetails}
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
const ChatScreen = withStyles(ChatScreenComponent, styles);
export default ChatScreen;
