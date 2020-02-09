import React, { Component } from 'react';
import {
  Icon,
  TopNavigation,
  TopNavigationAction,
  List,
  Button,
  Input,
} from 'react-native-ui-kitten';

import { View, SafeAreaView } from 'react-native';

import ChatMessage from '../../components/ChatMessage';

import messages from './data.json';
import styles from './ChatScreen.style';
import UserAvatar from '../../components/UserAvatar';
import { theme } from '../../theme.js';

const PaperPlaneIconFill = style => {
  return <Icon {...style} name="paper-plane" />;
};

const renderProfileAvatar = () => {
  return (
    <UserAvatar
      userName="Neymar Jr"
      size="small"
      defaultBGColor={theme['color-primary']}
    />
  );
};

const renderRightControls = style => {
  return <TopNavigationAction icon={renderProfileAvatar} />;
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

const onListContentSizeChange = e => {
  // setTimeout(() => this.listRef.current.scrollToEnd({ animated: true }), 0);
};

class ChatScreen extends Component {
  state = {
    message: '',
    allMessages: messages,
  };

  onNewMessageChange = text => {
    this.setState({
      message: text,
    });
  };

  onNewMessageAdd = () => {
    const { allMessages, message } = this.state;
    let tempArray = allMessages;
    tempArray.push({
      author: 'admin',
      text: message,
      date: '4:12 PM',
      read: true,
      delivered: true,
      alignment: 'flex-end',
    });
    this.setState({
      allMessages: tempArray,
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

  render() {
    const { allMessages } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <TopNavigation
          alignment="center"
          title="Neymar Jr"
          subtitle="Lase seen just now"
          rightControls={renderRightControls()}
          titleStyle={styles.headerTitle}
          subtitleStyle={styles.subHeaderTitle}
        />

        <View style={styles.container} autoDismiss={false}>
          <List
            ref={this.listRef}
            contentContainerStyle={styles.chatContainer}
            data={allMessages}
            onContentSizeChange={this.onListContentSizeChange}
            renderItem={renderMessage}
            initialScrollIndex={allMessages.length - 1}
          />
          <View style={styles.inputContainer}>
            <Input
              style={styles.input}
              placeholder="Type message..."
              isFocused={this.onFocused}
              onChangeText={this.onNewMessageChange}
            />
            {this.renderSendButton()}
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

export default ChatScreen;
