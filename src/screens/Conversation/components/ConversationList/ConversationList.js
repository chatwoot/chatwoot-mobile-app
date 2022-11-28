import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { Text } from 'components';
import {
  selectors as conversationSelectors,
  selectAllConversationFetched,
  selectConversationMeta,
} from 'reducer/conversationSlice';
import ConversationEmptyList from '../ConversationEmptyList/ConversationEmptyList';
import ConversationItem from '../ConversationItem/ConversationItem';
import ConversationEmptyMessage from '../ConversationEmptyMessage/ConversationEmptyMessage';
import i18n from 'i18n';
import createStyles from './ConversationList.style';

const propTypes = {
  assigneeType: PropTypes.string,
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
  isCountEnabled,
  onChangePageNumber,
  refreshConversations,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;
  const [refreshing, setRefreshing] = useState(false);
  const userId = useSelector(store => store.auth.user.id);
  const navigation = useNavigation();
  const conversationTypingUsers = useSelector(state => state.conversation.conversationTypingUsers);

  const filters = {
    assigneeType,
    conversationStatus,
    inboxId: activeInboxId,
    userId,
  };

  const allConversations = useSelector(state =>
    conversationSelectors.getFilteredConversations(state, filters),
  );
  const isAllConversationsAreFetched = useSelector(selectAllConversationFetched);

  const conversationMetaDetails = useSelector(selectConversationMeta);

  const conversationCount = () => {
    switch (assigneeType) {
      case 'mine':
        return conversationMetaDetails.mine_count;
      case 'unassigned':
        return conversationMetaDetails.unassigned_count;
      case 'all':
        return conversationMetaDetails.all_count;
      default:
        return 0;
    }
  };

  const keyExtractor = item => item.id;

  const onEndReached = () => {
    if (!isAllConversationsAreFetched) {
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
    setRefreshing(true);
    refreshConversations();
    wait(1000).then(() => setRefreshing(false));
  };

  const onSelectConversation = conversation => {
    const { id } = conversation;
    navigation.navigate('ChatScreen', { conversationId: id });
  };

  const isLoading = useSelector(state => state.conversations.loading);
  const shouldShowEmptyList = allConversations.length === 0 && isLoading;
  if (shouldShowEmptyList) {
    return <ConversationEmptyList />;
  }
  return allConversations.length ? (
    <View style={styles.container}>
      {isCountEnabled && (
        <View style={styles.conversationCountView}>
          <Text sm semiBold color={colors.text} style={styles.conversationCountView}>
            Showing {conversationCount()} conversations
          </Text>
        </View>
      )}

      <FlashList
        keyExtractor={keyExtractor}
        data={allConversations}
        renderItem={({ item }) => (
          <ConversationItem
            item={item}
            conversationTypingUsers={conversationTypingUsers}
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
