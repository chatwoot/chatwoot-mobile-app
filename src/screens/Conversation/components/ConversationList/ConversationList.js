import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { Text } from 'components';
import {
  selectors as conversationSelectors,
  selectAllConversationFetched,
  selectConversationMeta,
} from 'reducer/conversationSlice';
import ConversationEmptyMessage from '../ConversationItem/ConversationEmptyMessage';
import ConversationEmptyList from '../ConversationEmptyList/ConversationEmptyList';
import ConversationItem from '../ConversationItem/ConversationItem';

const propTypes = {
  assigneeType: PropTypes.string,
  conversationStatus: PropTypes.string,
  activeInboxId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChangePageNumber: PropTypes.func,
  refreshConversations: PropTypes.func,
  isCountEnabled: PropTypes.bool,
};

const createStyles = theme => {
  const { colors } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    loadMoreView: {
      alignItems: 'center',
      paddingTop: 16,
      paddingBottom: 16,
      height: '100%',
    },
    conversationCountView: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      backgroundColor: colors.backgroundLight,
    },
  });
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
            All conversations loaded 🎉
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
    navigation.navigate('Chat', { conversationId: id });
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
          <ConversationItem item={item} onPress={() => onSelectConversation(item)} />
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
