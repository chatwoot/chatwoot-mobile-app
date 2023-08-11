import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { Text } from 'components';
import { selectAllConversationFetched } from 'reducer/conversationSlice';

import { selectors as conversationSelectors } from 'reducer/conversationSlice.selector.js';
import ConversationEmptyList from '../ConversationEmptyList/ConversationEmptyList';
import ConversationItem from '../ConversationItem/ConversationItem';
import ConversationEmptyMessage from '../ConversationEmptyMessage/ConversationEmptyMessage';
import i18n from 'i18n';
import createStyles from './ConversationList.style';
import { selectUserId } from 'reducer/authSlice';
import { selectAllTypingUsers } from 'reducer/conversationTypingSlice';

const propTypes = {
  assigneeType: PropTypes.string,
  sortBy: PropTypes.string,
  conversationStatus: PropTypes.string,
  activeInboxId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChangePageNumber: PropTypes.func,
  refreshConversations: PropTypes.func,
  isCountEnabled: PropTypes.bool,
};

const wait = timeout => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
};

const ConversationList = ({
  assigneeType,
  conversationStatus,
  activeInboxId,
  sortBy,
  isCountEnabled,
  onChangePageNumber,
  refreshConversations,
}) => {
  const [isFlashListReady, setFlashListReady] = useState(false);
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;
  const [refreshing, setRefreshing] = useState(false);
  const userId = useSelector(selectUserId);
  const navigation = useNavigation();
  const conversationTypingUsers = useSelector(selectAllTypingUsers);
  const filters = {
    assigneeType,
    conversationStatus,
    inboxId: activeInboxId,
    userId,
    sortBy,
  };

  const allConversations = useSelector(state =>
    conversationSelectors.getFilteredConversations(state, filters),
  );
  const isAllConversationsAreFetched = useSelector(selectAllConversationFetched);

  const keyExtractor = item => item.id;

  const onEndReached = () => {
    const shouldLoadMoreConversations = isFlashListReady && !isAllConversationsAreFetched;
    if (shouldLoadMoreConversations) {
      onChangePageNumber();
    }
  };

  const renderMoreLoader = () => {
    return (
      <View style={styles.loadMoreView}>
        {isAllConversationsAreFetched ? (
          <Text sm color={colors.textLight}>
            {i18n.t('CONVERSATION.ALL_CONVERSATION_LOADED')} 🎉
          </Text>
        ) : (
          <ActivityIndicator size="small" />
        )}
      </View>
    );
  };

  const onRefresh = () => {
    setFlashListReady(false);
    setRefreshing(true);
    refreshConversations();
    wait(1000).then(() => setRefreshing(false));
  };

  const onSelectConversation = conversation => {
    const { id } = conversation;
    navigation.navigate('ChatScreen', {
      conversationId: id,
      isConversationOpenedExternally: false,
    });
  };

  const isLoading = useSelector(state => state.conversations.loading);
  const shouldShowEmptyList = allConversations.length === 0 && isLoading;
  if (shouldShowEmptyList) {
    return <ConversationEmptyList />;
  }
  return allConversations.length ? (
    <View style={styles.container}>
      <FlashList
        keyExtractor={keyExtractor}
        onScroll={() => {
          if (!isFlashListReady) {
            setFlashListReady(true);
          }
        }}
        data={allConversations}
        renderItem={({ item }) => (
          <ConversationItem
            item={item}
            conversationTypingUsers={conversationTypingUsers}
            showAssigneeLabel={assigneeType === 'all'}
            onPress={() => onSelectConversation(item)}
          />
        )}
        estimatedItemSize={20}
        contentInsetAdjustmentBehavior="automatic"
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderMoreLoader}
        onEndReached={onEndReached}
      />
    </View>
  ) : (
    <ConversationEmptyMessage />
  );
};

ConversationList.propTypes = propTypes;
export default ConversationList;
