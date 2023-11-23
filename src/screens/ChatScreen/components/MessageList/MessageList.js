import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';

import PropTypes from 'prop-types';
import { View, ActivityIndicator } from 'react-native';
import ChatMessage from '../ChatMessage';
import ReplyBox from '../ReplyBox';
import createStyles from './MessageList.style';
import { openURL } from 'helpers/UrlHelper';
import { selectMessagesLoading, selectAllMessagesFetched } from 'reducer/conversationSlice';
import { selectors as conversationSelectors } from 'reducer/conversationSlice.selector.js';
const propTypes = {
  loadMessages: PropTypes.func.isRequired,
  conversationId: PropTypes.number.isRequired,
};

const MessagesListComponent = ({ conversationId, loadMessages }) => {
  const [isFlashListReady, setFlashListReady] = React.useState(false);
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
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

  const onEndReached = () => {
    const shouldFetchMoreMessages = !isAllMessagesFetched && !isFetching && isFlashListReady;
    if (shouldFetchMoreMessages) {
      loadMessages();
    }
  };

  const renderMoreLoader = () => {
    if (isFetching) {
      return (
        <View style={styles.loadMoreSpinnerView}>
          <ActivityIndicator size="small" color={colors.textDark} animating={isFetching} />
        </View>
      );
    }
    return null;
  };

  const renderMessage = item => {
    return (
      <ChatMessage
        message={item.item}
        key={item.index}
        showAttachment={showAttachment}
        conversation={conversation}
      />
    );
  };

  return (
    <View style={styles.container} autoDismiss={false}>
      <View style={styles.chatView}>
        {allMessages.length ? (
          <FlashList
            onScroll={() => {
              if (!isFlashListReady) {
                setFlashListReady(true);
              }
            }}
            inverted
            contentContainerStyle={styles.listContainerStyle}
            keyboardShouldPersistTaps="never"
            scrollEventThrottle={16}
            keyExtractor={(item, index) => item + index}
            data={allMessages}
            estimatedItemSize={100}
            renderItem={renderMessage}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            contentInsetAdjustmentBehavior="automatic"
            ListFooterComponent={renderMoreLoader}
          />
        ) : null}
        {isFetching && !allMessages.length && (
          <View style={styles.loadMoreSpinnerView}>
            <ActivityIndicator size="small" color={colors.textDark} animating={isFetching} />
          </View>
        )}
      </View>
      <ReplyBox
        conversationId={conversationId}
        conversationDetails={conversation}
        inboxId={inboxId}
        enableReplyButton={allMessages.length > 0}
      />
    </View>
  );
};

MessagesListComponent.propTypes = propTypes;
export default MessagesListComponent;
