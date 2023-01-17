import React, { useEffect, useCallback } from 'react';
import { Spinner, withStyles } from '@ui-kitten/components';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { View, SafeAreaView, SectionList } from 'react-native';
import ChatMessage from './components/ChatMessage';
import ChatMessageDate from './components/ChatMessageDate';
import ReplyBox from './components/ReplyBox';
import ChatHeader from './components/ChatHeader';
import ChatHeaderLoader from './components/ChatHeaderLoader';
import styles from './ChatScreen.style';
import { openURL } from 'helpers/UrlHelper';

import { markNotificationAsRead } from 'actions/notification';
import { getGroupedConversation, findUniqueMessages } from 'helpers';
import { actions as CannedResponseActions } from 'reducer/cannedResponseSlice';
import {
  clearConversation,
  selectors as conversationSelectors,
  selectMessagesLoading,
  selectAllMessagesFetched,
} from 'reducer/conversationSlice';
import conversationActions from 'reducer/conversationSlice.action';
const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  route: PropTypes.object,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

const ChatScreenComponent = ({ eva: { style }, navigation, route }) => {
  const dispatch = useDispatch();
  const conversationTypingUsers = useSelector(state => state.conversation.conversationTypingUsers);

  const isFetching = useSelector(selectMessagesLoading);
  const isAllMessagesFetched = useSelector(selectAllMessagesFetched);

  const { conversationId, messages, primaryActorDetails, isConversationOpenedExternally } =
    route.params;

  const conversation = useSelector(state =>
    conversationSelectors.getConversationById(state, conversationId),
  );

  const allMessages = useSelector(state =>
    conversationSelectors.getMessagesByConversationId(state, conversationId),
  );

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
    if (primaryActorDetails && primaryActorDetails.primary_actor_id) {
      dispatch(
        markNotificationAsRead({
          primaryActorId: primaryActorDetails.primary_actor_id,
          primaryActorType: primaryActorDetails.primary_actor_type,
        }),
      );
    }
  }, [conversationId, dispatch, messages, primaryActorDetails]);

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
    navigation.goBack();
  };

  const onEndReached = ({ distanceFromEnd }) => {
    const shouldFetchMoreMessages = !isAllMessagesFetched;
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
    <ChatMessage message={item.item} key={item.index} showAttachment={showAttachment} />
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

      {!conversation ? (
        <View style={style.emptyContainer}>
          <Spinner size="medium" />
        </View>
      ) : null}

      <View style={style.container} autoDismiss={false}>
        <View style={style.chatView}>
          {groupedConversationList.length ? (
            <SectionList
              keyboardShouldPersistTaps="never"
              scrollEventThrottle={16}
              inverted
              onEndReached={onEndReached}
              sections={groupedConversationList}
              keyExtractor={(item, index) => item + index}
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
        <ReplyBox conversationId={conversationId} conversationDetails={conversation} />
      </View>
    </SafeAreaView>
  );
};

ChatScreenComponent.propTypes = propTypes;
const ChatScreen = withStyles(ChatScreenComponent, styles);
export default ChatScreen;
