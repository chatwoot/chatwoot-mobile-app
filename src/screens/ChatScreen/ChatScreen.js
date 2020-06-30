import React, { Component } from 'react';
import {
  Icon,
  TopNavigation,
  TopNavigationAction,
  Button,
  Spinner,
  withStyles,
  OverflowMenu,
  MenuItem,
} from '@ui-kitten/components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
  Platform,
  SectionList,
  Linking,
} from 'react-native';

import ChatMessage from '../../components/ChatMessage';
import ChatMessageDate from '../../components/ChatMessageDate';
import ScrollToBottomButton from '../../components/ScrollToBottomButton';
import styles from './ChatScreen.style';
import UserAvatar from '../../components/UserAvatar';
import {
  loadMessages,
  sendMessage,
  markMessagesAsRead,
  loadCannedResponses,
  resetConversation,
  toggleTypingStatus,
} from '../../actions/conversation';
import { markNotificationAsRead } from '../../actions/notification';
import { getGroupedConversation, getTypingUsersText, findUniqueMessages } from '../../helpers';
import i18n from '../../i18n';
import CustomText from '../../components/Text';

const BackIcon = (style) => (
  <Icon {...style} name="arrow-ios-back-outline" height={24} width={24} />
);

const BackAction = (props) => <TopNavigationAction {...props} icon={BackIcon} />;

const PaperPlaneIconFill = (style) => {
  return <Icon {...style} name="paper-plane" />;
};

const renderAnchor = () => <View />;

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

    this.props.loadCannedResponses();
    markAllMessagesAsRead({ conversationId });
  };

  onNewMessageChange = (text) => {
    this.setState({
      message: text,
    });

    const { cannedResponses } = this.props;

    if (text.charAt(0) === '/') {
      const query = text.substring(1).toLowerCase();
      const filteredCannedResponses = cannedResponses.filter((item) =>
        item.title.toLowerCase().includes(query),
      );
      if (filteredCannedResponses.length) {
        this.showCannedResponses({ filteredCannedResponses });
      } else {
        this.hideCannedResponses();
      }
    } else {
      this.hideCannedResponses();
    }
  };

  onNewMessageAdd = () => {
    const { message } = this.state;

    if (message) {
      const { route } = this.props;
      const {
        params: { conversationId },
      } = route;

      this.props.sendMessage({
        conversationId,
        message: {
          content: message,
          private: false,
        },
      });
      this.setState({
        message: '',
      });
    }
  };

  showAttachment = ({ type, dataUrl }) => {
    if (type === 'image') {
      const { navigation } = this.props;
      navigation.navigate('ImageScreen', {
        imageUrl: dataUrl,
      });
    } else {
      Linking.canOpenURL(dataUrl).then((supported) => {
        if (supported) {
          Linking.openURL(dataUrl);
        }
      });
    }
  };

  onBackPress = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  renderLeftControl = () => <BackAction onPress={this.onBackPress} />;

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

  onItemSelect = (itemSelected) => {
    const { filteredCannedResponses } = this.state;
    const indexSelected = itemSelected.row;

    const selectedItem = filteredCannedResponses[indexSelected];

    const { content } = selectedItem;
    this.setState({
      selectedIndex: indexSelected,
      menuVisible: false,
      message: content,
    });
  };

  toggleOverFlowMenu = () => {
    this.setState({
      menuVisible: !this.state.menuVisible,
    });
  };

  showCannedResponses = ({ filteredCannedResponses }) => {
    this.setState({
      selectedIndex: null,
      filteredCannedResponses,
      menuVisible: true,
    });
  };

  hideCannedResponses = () => {
    this.setState({
      selectedIndex: null,
      filteredCannedResponses: [],
      menuVisible: false,
    });
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
    if (scrollHight > 0) {
      this.setState({
        showScrollToButton: false,
      });
    } else {
      this.setState({
        showScrollToButton: false,
      });
    }
  }

  renderTitle = () => {
    const senderDetails = {
      name: null,
      thumbnail: null,
    };

    const {
      conversationDetails,
      route,
      conversationTypingUsers,
      eva: { style, theme },
    } = this.props;

    const {
      params: { conversationId },
    } = route;

    const typingUser = getTypingUsersText({
      conversationTypingUsers,
      conversationId,
    });
    const { meta } = route.params;
    if (meta) {
      const {
        sender: { name, thumbnail },
      } = meta;
      senderDetails.name = name;
      senderDetails.thumbnail = thumbnail;
    }
    if (!senderDetails.name && conversationDetails) {
      const {
        contact: { name, thumbnail },
      } = conversationDetails;
      senderDetails.name = name;
      senderDetails.thumbnail = thumbnail;
    }
    if (senderDetails.name) {
      return (
        <View style={style.headerView}>
          <UserAvatar
            style={style.avatarView}
            userName={senderDetails.name}
            thumbnail={senderDetails.thumbnail}
            defaultBGColor={theme['color-primary-default']}
          />
          <View style={style.titleView}>
            <View>
              <CustomText style={style.headerTitle}>{senderDetails.name}</CustomText>
            </View>
            {typingUser ? (
              <View>
                <CustomText style={style.subHeaderTitle}>
                  {typingUser ? `${typingUser}` : ''}
                </CustomText>
              </View>
            ) : null}
          </View>
        </View>
      );
    }
    return null;
  };

  renderTopNavigation = () => {
    return <TopNavigation title={this.renderTitle} accessoryLeft={this.renderLeftControl} />;
  };

  onBlur = () => {
    const { route } = this.props;
    const { conversationId } = route.params;
    this.props.toggleTypingStatus({ conversationId, typingStatus: 'off' });
  };
  onFocus = () => {
    const { route } = this.props;
    const { conversationId } = route.params;
    this.props.toggleTypingStatus({ conversationId, typingStatus: 'on' });
  };

  render() {
    const {
      allMessages,
      isFetching,
      eva: { style, theme },
    } = this.props;

    const {
      message,
      showScrollToButton,
      filteredCannedResponses,
      menuVisible,
      selectedIndex,
    } = this.state;

    const uniqueMessages = findUniqueMessages({ allMessages });
    const groupedConversationList = getGroupedConversation({
      conversations: uniqueMessages,
    });
    return (
      <SafeAreaView style={style.mainContainer}>
        <KeyboardAvoidingView
          style={style.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          enabled>
          {this.renderTopNavigation()}

          <View style={style.container} autoDismiss={false}>
            <View style={style.chatView}>
              {groupedConversationList.length ? (
                <SectionList
                  scrollEventThrottle={1900}
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
              {showScrollToButton && (
                <ScrollToBottomButton scrollToBottom={() => this.scrollToBottom()} />
              )}
              {isFetching && !groupedConversationList.length && (
                <View style={style.loadMoreSpinnerView}>
                  <Spinner size="medium" />
                </View>
              )}
            </View>

            <View style={style.inputView}>
              <TextInput
                style={style.input}
                placeholder={`${i18n.t('CONVERSATION.TYPE_MESSAGE')}...`}
                isFocused={this.onFocused}
                onBlur={this.onBlur}
                onFocus={this.onFocus}
                value={message}
                placeholderTextColor={theme['text-basic-color']}
                onChangeText={this.onNewMessageChange}
              />

              {filteredCannedResponses && (
                <OverflowMenu
                  anchor={renderAnchor}
                  data={filteredCannedResponses}
                  visible={menuVisible}
                  selectedIndex={selectedIndex}
                  onSelect={this.onItemSelect}
                  placement="top"
                  style={style.overflowMenu}
                  backdropStyle={style.backdrop}
                  onBackdropPress={this.toggleOverFlowMenu}>
                  {filteredCannedResponses.map((item) => (
                    <MenuItem title={item.title} key={item.id} />
                  ))}
                </OverflowMenu>
              )}
              <Button
                style={style.addMessageButton}
                appearance="ghost"
                size="large"
                accessoryLeft={PaperPlaneIconFill}
                onPress={this.onNewMessageAdd}
                disabled={message === '' ? true : false}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
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
