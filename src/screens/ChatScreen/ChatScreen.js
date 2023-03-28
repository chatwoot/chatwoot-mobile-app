import React, { useEffect, useCallback, useState } from 'react';
import { withStyles, Spinner } from '@ui-kitten/components';
import { useSelector, useDispatch } from 'react-redux';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import PropTypes from 'prop-types';
import { View, SafeAreaView, SectionList, AppState, useWindowDimensions } from 'react-native';
import { StackActions } from '@react-navigation/native';
import ChatMessage from './components/ChatMessage';
import ChatMessageDate from './components/ChatMessageDate';
import ReplyBox from './components/ReplyBox';
import ChatHeader from './components/ChatHeader';
import ChatHeaderLoader from './components/ChatHeaderLoader';
import styles from './ChatScreen.style';
import { openURL } from 'helpers/UrlHelper';
import { actions as notificationsActions } from 'reducer/notificationSlice';
import { getGroupedConversation, findUniqueMessages } from 'helpers';
import { actions as CannedResponseActions } from 'reducer/cannedResponseSlice';
import { selectAllTypingUsers } from 'reducer/conversationTypingSlice';
import {
  clearConversation,
  selectors as conversationSelectors,
  selectMessagesLoading,
  selectAllMessagesFetched,
} from 'reducer/conversationSlice';
import { dashboardAppSelector } from 'reducer/dashboardAppSlice';
import { selectUser } from 'reducer/authSlice';
import conversationActions from 'reducer/conversationSlice.action';
import { getCurrentRouteName } from 'helpers/NavigationHelper';
import { SCREENS } from 'constants';
import DashboardApp from './components/DashboardApp';
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
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);

  const dispatch = useDispatch();
  const conversationTypingUsers = useSelector(selectAllTypingUsers);
  const currentUser = useSelector(selectUser);

  const dashboardApps = useSelector(dashboardAppSelector.selectAll);
  const isDashboardAppsEmpty = dashboardApps?.length === 0;

  const [appState, setAppState] = useState(AppState.currentState);
  const isFetching = useSelector(selectMessagesLoading);
  const isAllMessagesFetched = useSelector(selectAllMessagesFetched);

  const dashboardRoutes = [];

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

  const inboxId = conversation?.inbox_id;

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
    { key: 'first', title: 'Messages', route: 'MessageRoute' },
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

  const showAttachment = ({ type, dataUrl }) => {
    if (type === 'image') {
      navigation.navigate('ImageScreen', {
        imageUrl: dataUrl,
      });
    } else {
      openURL({ URL: dataUrl });
    }
  };

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

  const onEndReached = ({ distanceFromEnd }) => {
    const shouldFetchMoreMessages = !isAllMessagesFetched && !isFetching;
    if (shouldFetchMoreMessages) {
      loadMessages();
    }
  };

  const renderMoreLoader = () => {
    if (isFetching) {
      return (
        <View style={style.loadMoreSpinnerView}>
          <Spinner size="medium" color="red" />
        </View>
      );
    }
    return null;
  };

  const renderMessage = item => (
    <ChatMessage
      message={item.item}
      key={item.index}
      showAttachment={showAttachment}
      conversation={conversation}
    />
  );

  const showConversationDetails = () => {
    if (conversation) {
      navigation.navigate('ConversationDetails', { conversationDetails: conversation });
    }
  };

  const uniqueMessages = findUniqueMessages({ allMessages });
  const groupedConversationList = getGroupedConversation({
    conversations: uniqueMessages,
  });

  const MessageRoute = () => (
    <View style={style.container} autoDismiss={false}>
      <View style={style.chatView}>
        {groupedConversationList.length ? (
          <SectionList
            keyboardShouldPersistTaps="never"
            scrollEventThrottle={16}
            inverted
            onEndReached={onEndReached}
            sections={groupedConversationList}
            keyExtractor={(item, i) => item + i}
            renderItem={renderMessage}
            renderSectionFooter={({ section: { date } }) => <ChatMessageDate date={date} />}
            style={style.chatContainer}
            ListFooterComponent={renderMoreLoader}
          />
        ) : null}
        {isFetching && !groupedConversationList.length && (
          <View style={style.loadMoreSpinnerView}>
            <Spinner size="medium" />
          </View>
        )}
      </View>
      <ReplyBox
        conversationId={conversationId}
        conversationDetails={conversation}
        inboxId={inboxId}
        conversationMetaDetails={conversationMetaDetails}
      />
    </View>
  );

  const dashboardScenes = {
    first: MessageRoute,
  };
  if (!isDashboardAppsEmpty) {
    dashboardRoutes.forEach(item => {
      dashboardScenes[item.key] = DashboardApp;
    });
  }
  const renderScene = SceneMap(dashboardScenes);
  const renderTabBar = props => (
    <TabBar
      {...props}
      labelStyle={style.tabLabel}
      activeColor="#1F93FF"
      inactiveColor="#8492a6"
      indicatorStyle={style.tabIndicator}
      style={style.tabBar}
      tabStyle={style.tabStyle}
      scrollEnabled
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

      <View style={style.container} autoDismiss={false}>
        {isDashboardAppsEmpty ? (
          <MessageRoute />
        ) : (
          <TabView
            renderTabBar={renderTabBar}
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

ChatScreenComponent.propTypes = propTypes;
const ChatScreen = withStyles(ChatScreenComponent, styles);
export default ChatScreen;
