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
import { ActionSheetCustom as ActionSheet } from 'react-native-actionsheet';

import {
  View,
  SafeAreaView,
  TextInput,
  SectionList,
  Linking,
  TouchableOpacity,
} from 'react-native';

import ChatMessage from '../../components/ChatMessage';
import ChatMessageDate from '../../components/ChatMessageDate';
import ScrollToBottomButton from '../../components/ScrollToBottomButton';
import styles from './ChatScreen.style';
import UserAvatar from '../../components/UserAvatar';
import { openURL } from '../../helpers/UrlHelper';

import {
  loadMessages,
  sendMessage,
  markMessagesAsRead,
  loadCannedResponses,
  resetConversation,
  toggleTypingStatus,
  getConversationDetails,
  toggleConversationStatus,
} from '../../actions/conversation';
import { markNotificationAsRead } from '../../actions/notification';
import { getGroupedConversation, getTypingUsersText, findUniqueMessages } from '../../helpers';
import i18n from '../../i18n';
import CustomText from '../../components/Text';
import { CONVERSATION_TOGGLE_STATUS } from '../../constants';

const BackIcon = (style) => (
  <Icon {...style} name="arrow-ios-back-outline" height={24} width={24} />
);

const MenuIcon = (style) => {
  return <Icon {...style} name="more-vertical" height={24} width={24} />;
};

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
        channel,
      } = meta;
      senderDetails.name = name;
      senderDetails.thumbnail = thumbnail;
      senderDetails.channel = channel;
    }
    if (!senderDetails.name && conversationDetails) {
      const {
        meta: {
          sender: { name, thumbnail },
          channel,
        },
      } = conversationDetails;
      senderDetails.name = name;
      senderDetails.thumbnail = thumbnail;
      senderDetails.channel = channel;
    }

    if (senderDetails.name) {
      return (
        <TouchableOpacity
          style={style.headerView}
          onPress={this.showConversationDetails}
          activeOpacity={0.5}>
          <UserAvatar
            style={style.avatarView}
            userName={senderDetails.name}
            thumbnail={senderDetails.thumbnail}
            defaultBGColor={theme['color-primary-default']}
            channel={senderDetails.channel}
          />
          <View style={style.titleView}>
            <View>
              <CustomText style={style.headerTitle}>
                {senderDetails.name.length > 24
                  ? ` ${senderDetails.name.substring(0, 20)}...`
                  : ` ${senderDetails.name}`}
              </CustomText>
            </View>
            {typingUser ? (
              <View>
                <CustomText style={style.subHeaderTitle}>
                  {typingUser ? `${typingUser}` : ''}
                </CustomText>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  };

  showActionSheet = () => {
    const {
      conversationDetails: { status },
    } = this.props;
    this.setState({
      conversationStatus: status,
    });

    this.ActionSheet.show();
  };

  toggleConversation = async () => {
    const { route } = this.props;
    const {
      params: { conversationId },
    } = route;
    this.props.toggleConversationStatus({ conversationId });
  };

  renderRightControl = () => {
    const { conversationDetails } = this.props;

    if (conversationDetails) {
      return <TopNavigationAction onPress={this.showActionSheet} icon={MenuIcon} />;
    }
    return null;
  };

  renderTopNavigation = () => {
    return (
      <TopNavigation
        title={this.renderTitle}
        accessoryLeft={this.renderLeftControl}
        accessoryRight={this.renderRightControl}
      />
    );
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
      conversationStatus,
    } = this.state;

    const uniqueMessages = findUniqueMessages({ allMessages });
    const groupedConversationList = getGroupedConversation({
      conversations: uniqueMessages,
    });

    return (
      <SafeAreaView style={style.mainContainer}>
        {this.renderTopNavigation()}

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
        <ActionSheet
          ref={(o) => (this.ActionSheet = o)}
          options={[
            i18n.t('CONVERSATION.CANCEL'),
            i18n.t(`CONVERSATION.${CONVERSATION_TOGGLE_STATUS[conversationStatus]}`),
            i18n.t('CONVERSATION.ASSIGN'),
          ]}
          cancelButtonIndex={0}
          destructiveButtonIndex={4}
          onPress={(index) => {
            if (index === 1) {
              this.toggleConversation();
            }
            if (index === 2) {
              const { conversationDetails, navigation } = this.props;
              if (conversationDetails) {
                navigation.navigate('ConversationAction', { conversationDetails });
              }
            }
          }}
        />
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
    toggleConversationStatus: ({ conversationId, message }) =>
      dispatch(toggleConversationStatus({ conversationId })),
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
