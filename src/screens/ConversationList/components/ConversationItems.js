import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, withStyles, Spinner } from '@ui-kitten/components';
import { FlatList, View } from 'react-native';

import ConversationItem from './ConversationItem';
import CustomText from 'components/Text';
import i18n from 'i18n';
import { loadInitialMessage, setConversation } from 'actions/conversation';
import { findUniqueConversations } from 'helpers';

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  loadConversations: PropTypes.func,
  onChangePageNumber: PropTypes.func,
  payload: PropTypes.array.isRequired,
};

const wait = timeout => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
};

const ConversationItems = ({
  eva: { style },
  navigation,
  payload,
  loadConversations,
  onChangePageNumber,
}) => {
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const [onEndReachedCalledDuringMomentum, setOnEndReachedCalledDuringMomentum] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const inboxes = useSelector(state => state.inbox.data);
  const conversationTypingUsers = useSelector(state => state.conversation.conversationTypingUsers);
  const isAllConversationsLoaded = useSelector(
    state => state.conversation.isAllConversationsLoaded,
  );

  const onSelectConversation = item => {
    const { messages, meta } = item;
    const conversationId = item.id;
    dispatch(setConversation({ conversationId }));
    dispatch(loadInitialMessage({ messages }));
    navigation.navigate('ChatScreen', {
      conversationId,
      meta,
      messages,
    });
  };

  const onEndReached = async ({ distanceFromEnd }) => {
    if (!onEndReachedCalledDuringMomentum) {
      onChangePageNumber();
      setOnEndReachedCalledDuringMomentum(true);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
    wait(1000).then(() => setRefreshing(false));
  };

  const renderMoreLoader = () => {
    return (
      <View style={style.loadMoreSpinnerView}>
        {!isAllConversationsLoaded ? (
          <Spinner size="medium" />
        ) : (
          <CustomText> {i18n.t('CONVERSATION.ALL_CONVERSATION_LOADED')} 🎉</CustomText>
        )}
      </View>
    );
  };

  // eslint-disable-next-line react/prop-types
  const renderItem = ({ item }) => (
    <ConversationItem
      item={item}
      onSelectConversation={onSelectConversation}
      inboxes={inboxes}
      conversationTypingUsers={conversationTypingUsers}
    />
  );

  const uniqueConversations = findUniqueConversations({ payload });
  return (
    <Layout style={style.tabContainer}>
      <FlatList
        onRefresh={onRefresh}
        refreshing={refreshing}
        keyboardShouldPersistTaps="handled"
        data={uniqueConversations}
        renderItem={renderItem}
        ref={inputRef}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.01}
        onMomentumScrollBegin={() => {
          setOnEndReachedCalledDuringMomentum(false);
        }}
        ListFooterComponent={renderMoreLoader}
        // eslint-disable-next-line react/prop-types
        keyExtractor={item => item.id.toString()}
      />
    </Layout>
  );
};

ConversationItems.propTypes = propTypes;

const styles = theme => ({
  tabContainer: {
    paddingBottom: 120,
    minHeight: 64,
  },
  loadMoreSpinnerView: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    height: '100%',
    backgroundColor: theme['background-basic-color-1'],
  },
});
const ConversationItemsComponent = withStyles(ConversationItems, styles);
export default ConversationItemsComponent;
