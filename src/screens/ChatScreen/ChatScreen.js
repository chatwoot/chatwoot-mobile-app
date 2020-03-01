import React, { Component } from 'react';
import {
  Icon,
  TopNavigation,
  TopNavigationAction,
  List,
  Button,
  Spinner,
} from 'react-native-ui-kitten';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
  Platform,
} from 'react-native';

import ChatMessage from '../../components/ChatMessage';

import styles from './ChatScreen.style';
import UserAvatar from '../../components/UserAvatar';
import { theme } from '../../theme.js';
import {
  loadMessages,
  sendMessage,
  markMessagesAsRead,
} from '../../actions/conversation';

const BackIcon = style => <Icon {...style} name="arrow-ios-back-outline" />;

const BackAction = props => <TopNavigationAction {...props} icon={BackIcon} />;

const PaperPlaneIconFill = style => {
  return <Icon {...style} name="paper-plane" />;
};

const renderMessage = info => {
  return (
    <ChatMessage
      index={info.index}
      message={info.item}
      alignment={info.item.alignment}
    />
  );
};

class ChatScreen extends Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    allMessages: PropTypes.shape({}),
    sendMessage: PropTypes.func,
    loadMessages: PropTypes.func,
    isFetching: PropTypes.bool,
    isAllMessagesLoaded: PropTypes.bool,
    markAllMessagesAsRead: PropTypes.func,
  };

  static defaultProps = {
    isFetching: false,
    isAllMessagesLoaded: false,
    sendMessage: () => {},
    markAllMessagesAsRead: () => {},
    allMessages: [],
  };

  state = {
    message: '',
    onEndReachedCalledDuringMomentum: true,
  };

  componentDidMount = () => {
    const { navigation, markAllMessagesAsRead } = this.props;
    const {
      state: {
        params: { messages },
      },
    } = navigation;
    const lastMessage = [...messages].reverse().pop();

    const { conversation_id: conversationId } = lastMessage;

    this.props.loadMessages({ conversationId });
    markAllMessagesAsRead({ conversationId });
  };

  onNewMessageChange = text => {
    this.setState({
      message: text,
    });
  };

  onNewMessageAdd = () => {
    const { navigation } = this.props;
    const { message } = this.state;

    const {
      state: {
        params: { conversationId },
      },
    } = navigation;

    this.props.sendMessage({
      conversationId,
      message: {
        message: message,
        private: false,
      },
    });
    this.setState({
      message: '',
    });
  };

  renderSendButton = () => {
    return (
      <Button
        style={styles.addMessageButton}
        appearance="ghost"
        size="large"
        icon={PaperPlaneIconFill}
        onPress={this.onNewMessageAdd}
      />
    );
  };

  renderProfileAvatar = props => {
    const { navigation } = this.props;
    const {
      state: {
        params: {
          meta: {
            sender: { name, thumbnail },
          },
        },
      },
    } = navigation;
    return (
      <UserAvatar
        userName={name}
        size="small"
        thumbnail={thumbnail}
        defaultBGColor={theme['color-primary']}
      />
    );
  };

  renderRightControls = style => {
    return <TopNavigationAction icon={this.renderProfileAvatar} />;
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
    const { isAllMessagesLoaded, isFetching } = this.props;

    return (
      <View style={styles.loadMoreSpinnerView}>
        {!isAllMessagesLoaded && isFetching ? (
          <Spinner size="medium" color="red" />
        ) : null}
      </View>
    );
  };

  render() {
    const { allMessages, navigation, isFetching } = this.props;

    const { message } = this.state;

    const {
      state: {
        params: {
          meta: {
            sender: { name },
          },
        },
      },
    } = navigation;

    const completeMessages = []
      .concat(allMessages)
      .reverse()
      .filter(item => item.content !== '');

    return (
      <SafeAreaView style={styles.mainContainer}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          enabled>
          <TopNavigation
            alignment="center"
            title={name}
            rightControls={this.renderRightControls()}
            leftControl={this.renderLeftControl()}
            titleStyle={styles.headerTitle}
            subtitleStyle={styles.subHeaderTitle}
          />

          <View style={styles.container} autoDismiss={false}>
            <View style={styles.chatView}>
              {completeMessages.length ? (
                <List
                  ref={ref => {
                    this.myFlatListRef = ref;
                  }}
                  onEndReached={this.onEndReached.bind(this)}
                  onEndReachedThreshold={0.5}
                  onMomentumScrollBegin={() => {
                    this.setState({
                      onEndReachedCalledDuringMomentum: false,
                    });
                  }}
                  inverted
                  contentContainerStyle={styles.chatContainer}
                  data={completeMessages}
                  renderItem={renderMessage}
                  ListFooterComponent={this.renderMoreLoader}
                />
              ) : null}
              {isFetching && !completeMessages.length && (
                <View style={styles.loadMoreSpinnerView}>
                  <Spinner size="medium" />
                </View>
              )}
            </View>

            <View style={styles.inputView}>
              <TextInput
                style={styles.input}
                placeholder="Type message..."
                isFocused={this.onFocused}
                value={message}
                placeholderTextColor={theme['text-primary-color']}
                onChangeText={this.onNewMessageChange}
              />
              {this.renderSendButton()}
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

function bindAction(dispatch) {
  return {
    loadMessages: ({ conversationId, beforeId }) =>
      dispatch(loadMessages({ conversationId, beforeId })),
    sendMessage: ({ conversationId, message }) =>
      dispatch(sendMessage({ conversationId, message })),
    markAllMessagesAsRead: ({ conversationId }) =>
      dispatch(markMessagesAsRead({ conversationId })),
  };
}
function mapStateToProps(state) {
  return {
    allMessages: state.conversation.allMessages,
    isFetching: state.conversation.isFetching,
    isAllMessagesLoaded: state.conversation.isAllMessagesLoaded,
  };
}

export default connect(mapStateToProps, bindAction)(ChatScreen);
