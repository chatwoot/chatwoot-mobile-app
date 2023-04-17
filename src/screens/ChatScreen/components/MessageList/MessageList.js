import React from 'react';
import { Spinner, withStyles } from '@ui-kitten/components';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { View, SectionList } from 'react-native';
import ChatMessage from '../ChatMessage';
import ChatMessageDate from '../ChatMessageDate';
import ReplyBox from '../ReplyBox';
import styles from './MessageList.style';
import { openURL } from 'helpers/UrlHelper';
import { getGroupedConversation, findUniqueMessages } from 'helpers';
import {
  selectors as conversationSelectors,
  selectMessagesLoading,
  selectAllMessagesFetched,
} from 'reducer/conversationSlice';
const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  loadMessages: PropTypes.func.isRequired,
  conversationId: PropTypes.number.isRequired,
};

const MessagesListComponent = ({ eva: { style }, conversationId, loadMessages }) => {
  const navigation = useNavigation();
  const isFetching = useSelector(selectMessagesLoading);
  const isAllMessagesFetched = useSelector(selectAllMessagesFetched);

  const conversation = useSelector(state =>
    conversationSelectors.getConversationById(state, conversationId),
  );

  const allMessages = useSelector(state =>
    conversationSelectors.getMessagesByConversationId(state, conversationId),
  );

  const inboxId = conversation?.inbox_id;

  const showAttachment = ({ type, dataUrl }) => {
    if (type === 'image') {
      navigation.navigate('ImageScreen', {
        imageUrl: dataUrl,
      });
    } else {
      openURL({ URL: dataUrl });
    }
  };

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

  const uniqueMessages = findUniqueMessages({ allMessages });
  const groupedConversationList = getGroupedConversation({
    conversations: uniqueMessages,
  });

  return (
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
      <ReplyBox
        conversationId={conversationId}
        conversationDetails={conversation}
        inboxId={inboxId}
        enableReplyButton={groupedConversationList.length > 0}
      />
    </View>
  );
};

MessagesListComponent.propTypes = propTypes;
const MessagesList = withStyles(MessagesListComponent, styles);
export default MessagesList;
