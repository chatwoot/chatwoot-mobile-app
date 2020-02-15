import React, { Component } from 'react';
import {
  Icon,
  TopNavigation,
  TopNavigationAction,
  List,
  Button,
  Input,
  Spinner,
} from 'react-native-ui-kitten';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';

import ChatMessage from '../../components/ChatMessage';

import styles from './ChatScreen.style';
import UserAvatar from '../../components/UserAvatar';
import { theme } from '../../theme.js';
import { loadMoreMessages, sendMessage } from '../../actions/conversation';

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
    sendMessages: PropTypes.func,
    loadAllMessages: PropTypes.func,
    isFetching: PropTypes.bool,
  };

  static defaultProps = {
    isFetching: false,
    loadAllMessages: () => {},
    sendMessages: () => {},
    allMessages: [],
  };

  state = {
    message: '',
  };

  componentDidMount = () => {
    const { navigation } = this.props;
    const {
      state: {
        params: { messages },
      },
    } = navigation;
    const lastMessage = [...messages].pop();
    const { conversation_id: conversationId, id: beforeId } = lastMessage;
    const { loadAllMessages } = this.props;
    loadAllMessages({ conversationId, beforeId });
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
    const { sendMessages } = this.props;
    sendMessages({
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

  onListContentSizeChange = e => {
    // console.log(this.refs.current);
    // setTimeout(() => this.listRef.current.scrollToEnd({ animated: true }), 0);
  };

  renderLeftControl = () => <BackAction onPress={this.onBackPress} />;

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

    return (
      <SafeAreaView style={styles.mainContainer}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>
          <TopNavigation
            alignment="center"
            title={name}
            subtitle="Lase seen just now"
            rightControls={this.renderRightControls()}
            leftControl={this.renderLeftControl()}
            titleStyle={styles.headerTitle}
            subtitleStyle={styles.subHeaderTitle}
          />

          <View style={styles.container} autoDismiss={false}>
            <View style={styles.chatView}>
              {!isFetching ? (
                <ScrollView
                  ref="scrollView"
                  style={{
                    flex: 1,
                    height: '100%',
                    borderColor: 'pink',
                    borderWidth: 1,
                  }}
                  onContentSizeChange={(width, height) =>
                    this.refs.scrollView.scrollTo({ y: height })
                  }>
                  <List
                    ref={this.listRef}
                    maxHeight="100%"
                    contentContainerStyle={styles.chatContainer}
                    data={allMessages}
                    renderItem={renderMessage}
                  />
                </ScrollView>
              ) : (
                <View style={styles.spinnerView}>
                  <Spinner size="medium" />
                </View>
              )}
            </View>

            <View style={styles.inputView}>
              <Input
                style={styles.input}
                placeholder="Type message..."
                isFocused={this.onFocused}
                value={message}
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
    loadAllMessages: ({ conversationId, beforeId }) =>
      dispatch(loadMoreMessages({ conversationId, beforeId })),
    sendMessages: ({ conversationId, message }) =>
      dispatch(sendMessage({ conversationId, message })),
  };
}
function mapStateToProps(state) {
  return {
    allMessages: state.conversation.allMessages,
    isFetching: state.conversation.isFetching,
  };
}

export default connect(mapStateToProps, bindAction)(ChatScreen);
