import React, { useEffect, useState } from 'react';
import { Spinner, withStyles } from '@ui-kitten/components';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { View, SafeAreaView, SectionList } from 'react-native';
import ChatMessage from './components/ChatMessage';
import ChatMessageDate from './components/ChatMessageDate';
import ReplyBox from './components/ReplyBox';
import ChatHeader from './components/ChatHeader';
import ScrollToBottomButton from '../../components/ScrollToBottomButton';
import styles from './ChatScreen.style';
import { openURL } from '../../helpers/UrlHelper';

import {
  loadMessages,
  markMessagesAsRead,
  resetConversation,
  getConversationDetails,
} from '../../actions/conversation';

import { markNotificationAsRead } from '../../actions/notification';
import { getGroupedConversation, findUniqueMessages } from '../../helpers';
import { actions as CannedResponseActions } from '../../reducer/cannedResponseSlice';

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
  resetConversation: PropTypes.func,
  cannedResponses: PropTypes.array.isRequired,
  allMessages: PropTypes.array.isRequired,
  conversationDetails: PropTypes.object,
  loadMessages: PropTypes.func,
  fetchCannedResponses: PropTypes.func,
  isFetching: PropTypes.bool,
  isAllMessagesLoaded: PropTypes.bool,
  markAllMessagesAsRead: PropTypes.func,
  toggleTypingStatus: PropTypes.func,
  markMessagesAsRead: PropTypes.func,
  markNotificationAsRead: PropTypes.func,
  getConversationDetails: PropTypes.func,
  conversationTypingUsers: PropTypes.shape({}),
};

const defaultProps = {
  isFetching: false,
  isAllMessagesLoaded: false,
  markMessagesAsRead: () => {},
  allMessages: [],
  cannedResponses: [],
  conversationTypingUsers: {},
};

const ChatScreenComponent = ({ eva: { style }, navigation, route }) => {
  const dispatch = useDispatch();
  const [onEndReachedCalledDuringMomentum, setOnEndReachedCalledDuringMomentum] = useState(true);
  const conversationDetails = useSelector(state => state.conversation.conversationDetails);
  const allMessages = useSelector(state => state.conversation.allMessages);
  const isFetching = useSelector(state => state.conversation.isFetching);
  const isAllMessagesLoaded = useSelector(state => state.conversation.isAllMessagesLoaded);
  const conversationTypingUsers = useSelector(state => state.conversation.conversationTypingUsers);
  const showScrollToButton = false;

  useEffect(() => {
    const { conversationId, meta, messages, primaryActorDetails } = route.params;

    if (!meta) {
      dispatch(resetConversation());
    }
    let beforeId = null;
    if (messages && messages.length) {
      const [lastMessage] = messages;
      const { id } = lastMessage;
      beforeId = id;
    }
    dispatch(loadMessages({ conversationId, beforeId }));
    dispatch(getConversationDetails({ conversationId }));
    dispatch(markMessagesAsRead({ conversationId }));
    dispatch(CannedResponseActions.index());
    if (primaryActorDetails && primaryActorDetails.primary_actor_id) {
      dispatch(
        markNotificationAsRead({
          primaryActorId: primaryActorDetails.primary_actor_id,
          primaryActorType: primaryActorDetails.primary_actor_type,
        }),
      );
    }
  }, [dispatch, route.params]);

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
  const loadMoreMessages = () => {
    if (!isAllMessagesLoaded) {
      const [lastMessage] = allMessages;
      const { conversation_id: conversationId, id: beforeId } = lastMessage;
      dispatch(loadMessages({ conversationId, beforeId }));
    }
  };

  const onEndReached = ({ distanceFromEnd }) => {
    if (!onEndReachedCalledDuringMomentum) {
      loadMoreMessages();
      setOnEndReachedCalledDuringMomentum(true);
    }
  };

  const renderMoreLoader = () => {
    return (
      <View style={style.loadMoreSpinnerView}>
        {!isAllMessagesLoaded && isFetching ? <Spinner size="medium" color="red" /> : null}
      </View>
    );
  };

  const renderMessage = item => (
    <ChatMessage message={item.item} key={item.index} showAttachment={showAttachment} />
  );

  const scrollToBottom = () => {
    // this.setState({
    //   showScrollToButton: false,
    // });
    // this.SectionListReference.scrollToLocation({
    //   animated: true,
    //   itemIndex: 0,
    //   viewPosition: 0,
    // });
  };

  const setCurrentReadOffset = event => {
    // const scrollHight = Math.floor(event.nativeEvent.contentOffset.y);
    // if (scrollHight > 50) {
    //   this.setState({
    //     showScrollToButton: false,
    //   });
    // } else {
    //   this.setState({
    //     showScrollToButton: false,
    //   });
    // }
  };

  const showConversationDetails = () => {
    if (conversationDetails) {
      navigation.navigate('ConversationDetails', { conversationDetails });
    }
  };

  const {
    params: { conversationId, meta },
  } = route;

  const uniqueMessages = findUniqueMessages({ allMessages });
  const groupedConversationList = getGroupedConversation({
    conversations: uniqueMessages,
  });

  return (
    <SafeAreaView style={style.mainContainer}>
      <ChatHeader
        conversationId={conversationId}
        conversationTypingUsers={conversationTypingUsers}
        conversationDetails={conversationDetails}
        conversationMetaDetails={meta}
        showConversationDetails={showConversationDetails}
        onBackPress={onBackPress}
      />

      <View style={style.container} autoDismiss={false}>
        <View style={style.chatView}>
          {groupedConversationList.length ? (
            <SectionList
              keyboardShouldPersistTaps="never"
              scrollEventThrottle={16}
              onScroll={event => setCurrentReadOffset(event)}
              inverted
              onEndReached={onEndReached.bind(this)}
              onEndReachedThreshold={0.5}
              onMomentumScrollBegin={() => {
                setOnEndReachedCalledDuringMomentum(false);
              }}
              sections={groupedConversationList}
              keyExtractor={(item, index) => item + index}
              renderItem={renderMessage}
              renderSectionFooter={({ section: { date } }) => <ChatMessageDate date={date} />}
              style={style.chatContainer}
              ListFooterComponent={renderMoreLoader}
            />
          ) : null}
          {showScrollToButton && <ScrollToBottomButton scrollToBottom={scrollToBottom} />}
          {isFetching && !groupedConversationList.length && (
            <View style={style.loadMoreSpinnerView}>
              <Spinner size="medium" />
            </View>
          )}
        </View>
        <ReplyBox conversationId={conversationId} conversationDetails={conversationDetails} />
      </View>
    </SafeAreaView>
  );
};

ChatScreenComponent.propTypes = propTypes;
ChatScreenComponent.defaultProps = defaultProps;
const ChatScreen = withStyles(ChatScreenComponent, styles);
export default ChatScreen;
