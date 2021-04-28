import React, { Component } from 'react';
import { Spinner, withStyles } from '@ui-kitten/components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, SafeAreaView, SectionList, Linking } from 'react-native';
import ChatMessage from './components/ChatMessage';
import ChatMessageDate from './components/ChatMessageDate';
import ReplyBox from './components/ReplyBox';
import ChatHeader from './components/ChatHeader';
import ScrollToBottomButton from '../../components/ScrollToBottomButton';
import styles from './ChatScreen.style';
import { openURL } from '../../helpers/UrlHelper';

import {
  loadMessages,
  sendMessage,
  markMessagesAsRead,
  loadCannedResponses,
  resetConversation,
  toggleTypingStatus,
  getConversationDetails,
} from '../../actions/conversation';
import { markNotificationAsRead } from '../../actions/notification';
import { getGroupedConversation, findUniqueMessages } from '../../helpers';

class ChatScreenComponent extends Component {
  static propTypes = {
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
    sendMessage: PropTypes.func,
    loadMessages: PropTypes.func,
    loadCannedResponses: PropTypes.func,
    isFetching: PropTypes.bool,
    isAllMessagesLoaded: PropTypes.bool,
    markAllMessagesAsRead: PropTypes.func,
    toggleTypingStatus: PropTypes.func,
    markMessagesAsRead: PropTypes.func,
    markNotificationAsRead: PropTypes.func,
    getConversationDetails: PropTypes.func,
    toggleConversationStatus: PropTypes.func,
    conversationTypingUsers: PropTypes.shape({}),
  };

  static defaultProps = {
    isFetching: false,
    isAllMessagesLoaded: false,
    sendMessage: () => {},
    markMessagesAsRead: () => {},
    allMessages: [],
    cannedResponses: [],
    conversationTypingUsers: {},
  };

  state = {
    message: '',
    onEndReachedCalledDuringMomentum: true,
    menuVisible: false,
    selectedIndex: null,
    filteredCannedResponses: [],
    showScrollToButton: false,
    conversationStatus: null,
  };

  componentDidMount = () => {
    const { markAllMessagesAsRead, route } = this.props;
    const { conversationId, meta, messages, primaryActorDetails } = route.params;

    // Clear all notification related the conversation
    if (primaryActorDetails) {
      this.props.markNotificationAsRead({
        primaryActorId: primaryActorDetails.primary_actor_id,
        primaryActorType: primaryActorDetails.primary_actor_type,
      });
    }
    // Reset all messages if app is opening from external link (Deep linking or Push)
    if (!meta) {
      this.props.resetConversation();
    }
    let beforeId = null;
    if (messages && messages.length) {
      const [lastMessage] = messages;
      const { id } = lastMessage;
      beforeId = id;
    }
    this.props.loadMessages({ conversationId, beforeId });
    this.props.getConversationDetails({ conversationId });
    this.props.markMessagesAsRead({ conversationId });
    this.props.loadCannedResponses();
    markAllMessagesAsRead({ conversationId });
  };

  showAttachment = ({ type, dataUrl }) => {
    const { navigation } = this.props;
    if (type === 'image') {
      navigation.navigate('ImageScreen', {
        imageUrl: dataUrl,
      });
    } else {
      Linking.canOpenURL(dataUrl).then((supported) => {
        if (supported) {
          openURL({ URL: dataUrl });
        }
      });
    }
  };

  onBackPress = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };
  loadMoreMessages = () => {
    const { allMessages, isAllMessagesLoaded } = this.props;

    if (!isAllMessagesLoaded) {
      const [lastMessage] = allMessages;
      const { conversation_id: conversationId, id: beforeId } = lastMessage;
      this.props.loadMessages({ conversationId, beforeId });
    }
  };

  onEndReached = ({ distanceFromEnd }) => {
    const { onEndReachedCalledDuringMomentum } = this.state;
    if (!onEndReachedCalledDuringMomentum) {
      this.loadMoreMessages();
      this.setState({
        onEndReachedCalledDuringMomentum: true,
      });
    }
  };

  renderMoreLoader = () => {
    const {
      isAllMessagesLoaded,
      isFetching,
      eva: { style },
    } = this.props;

    return (
      <View style={style.loadMoreSpinnerView}>
        {!isAllMessagesLoaded && isFetching ? <Spinner size="medium" color="red" /> : null}
      </View>
    );
  };

  renderMessage = (item) => (
    <ChatMessage message={item.item} key={item.index} showAttachment={this.showAttachment} />
  );

  scrollToBottom = () => {
    this.setState({
      showScrollToButton: false,
    });
    this.SectionListReference.scrollToLocation({
      animated: true,
      itemIndex: 0,
      viewPosition: 0,
    });
  };

  setCurrentReadOffset(event) {
    const scrollHight = Math.floor(event.nativeEvent.contentOffset.y);

    if (scrollHight > 50) {
      this.setState({
        showScrollToButton: false,
      });
    } else {
      this.setState({
        showScrollToButton: false,
      });
    }
  }

  showConversationDetails = () => {
    const { conversationDetails, navigation } = this.props;

    if (conversationDetails) {
      navigation.navigate('ConversationDetails', { conversationDetails });
    }
  };

  render() {
    const {
      allMessages,
      isFetching,
      eva: { style },
      route,
      cannedResponses,
      conversationTypingUsers,
      conversationDetails,
    } = this.props;
    const {
      params: { conversationId, meta },
    } = route;

    const { showScrollToButton } = this.state;
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
          showConversationDetails={this.showConversationDetails}
          onBackPress={this.onBackPress}
        />

        <View style={style.container} autoDismiss={false}>
          <View style={style.chatView}>
            {groupedConversationList.length ? (
              <SectionList
                keyboardShouldPersistTaps="never"
                scrollEventThrottle={16}
                onScroll={(event) => this.setCurrentReadOffset(event)}
                ref={(ref) => {
                  this.SectionListReference = ref;
                }}
                inverted
                onEndReached={this.onEndReached.bind(this)}
                onEndReachedThreshold={0.5}
                onMomentumScrollBegin={() => {
                  this.setState({
                    onEndReachedCalledDuringMomentum: false,
                  });
                }}
                sections={groupedConversationList}
                keyExtractor={(item, index) => item + index}
                renderItem={this.renderMessage}
                renderSectionFooter={({ section: { date } }) => <ChatMessageDate date={date} />}
                style={style.chatContainer}
                ListFooterComponent={this.renderMoreLoader}
              />
            ) : null}
            {showScrollToButton && <ScrollToBottomButton scrollToBottom={this.scrollToBottom} />}
            {isFetching && !groupedConversationList.length && (
              <View style={style.loadMoreSpinnerView}>
                <Spinner size="medium" />
              </View>
            )}
          </View>
          <ReplyBox conversationId={conversationId} cannedResponses={cannedResponses} />
        </View>
      </SafeAreaView>
    );
  }
}

function bindAction(dispatch) {
  return {
    resetConversation: () => dispatch(resetConversation()),
    loadMessages: ({ conversationId, beforeId }) =>
      dispatch(loadMessages({ conversationId, beforeId })),
    loadCannedResponses: () => dispatch(loadCannedResponses()),
    getConversationDetails: ({ conversationId }) =>
      dispatch(getConversationDetails({ conversationId })),
    sendMessage: ({ conversationId, message }) =>
      dispatch(sendMessage({ conversationId, message })),
    markAllMessagesAsRead: ({ conversationId }) => dispatch(markMessagesAsRead({ conversationId })),
    toggleTypingStatus: ({ conversationId, typingStatus }) =>
      dispatch(toggleTypingStatus({ conversationId, typingStatus })),
    markNotificationAsRead: ({ primaryActorId, primaryActorType }) =>
      dispatch(markNotificationAsRead({ primaryActorId, primaryActorType })),
  };
}
function mapStateToProps(state) {
  return {
    conversationDetails: state.conversation.conversationDetails,
    allMessages: state.conversation.allMessages,
    cannedResponses: state.conversation.cannedResponses,
    isFetching: state.conversation.isFetching,
    isAllMessagesLoaded: state.conversation.isAllMessagesLoaded,
    conversationTypingUsers: state.conversation.conversationTypingUsers,
  };
}

const ChatScreen = withStyles(ChatScreenComponent, styles);
export default connect(mapStateToProps, bindAction)(ChatScreen);
