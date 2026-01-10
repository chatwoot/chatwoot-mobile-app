import React, { useCallback } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { Message } from '@/types';
import { MESSAGE_TYPES } from '@/constants';
import { useRefsContext } from '@/context';

interface BareMessagesListProps {
  messages: (Message | { date: string })[];
  onEndReached: () => void;
  currentUserId: number;
}

/**
 * BARE BONES Messages List - Zero Dependencies
 * 
 * NO FlashList
 * NO Reanimated
 * NO Animations
 * NO Keyboard handling
 * 
 * Just plain React Native FlatList to isolate crash source
 */
export const BareMessagesList: React.FC<BareMessagesListProps> = ({
  messages,
  onEndReached,
  currentUserId,
}) => {
  const { messageListRef } = useRefsContext();

  const renderItem = useCallback(({ item }: { item: Message | { date: string } }) => {
    try {
      if (!item) return <View style={{ height: 1 }} />;

      // Date separator
      if ('date' in item) {
        return (
          <View style={styles.dateContainer}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
          </View>
        );
      }

      // Activity message
      if (item.messageType === MESSAGE_TYPES.ACTIVITY) {
        return (
          <View style={styles.activityContainer}>
            <Text style={styles.activityText}>{item.content || 'Activity'}</Text>
          </View>
        );
      }

      // Regular message
      const isMyMessage = item.senderId === currentUserId;
      
      return (
        <View style={[styles.msgContainer, isMyMessage ? styles.myMsg : styles.otherMsg]}>
          <View style={[styles.bubble, isMyMessage ? styles.myBubble : styles.otherBubble]}>
            <Text style={styles.msgText}>{item.content || '[empty]'}</Text>
          </View>
        </View>
      );
    } catch (e) {
      console.error('Render error:', e);
      return <View style={{ height: 1 }} />;
    }
  }, [currentUserId]);

  const keyExtractor = useCallback((item: any, index: number) => {
    try {
      if ('date' in item) return `d-${index}`;
      return `m-${item?.id || index}`;
    } catch {
      return `f-${index}`;
    }
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={messageListRef as any}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        inverted
        contentContainerStyle={styles.content}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={15}
        removeClippedSubviews={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 12,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateBadge: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  activityContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  activityText: {
    fontSize: 13,
    color: '#888',
  },
  msgContainer: {
    marginVertical: 2,
  },
  myMsg: {
    alignItems: 'flex-end',
  },
  otherMsg: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 12,
  },
  myBubble: {
    backgroundColor: '#DCF8C6',
  },
  otherBubble: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  msgText: {
    fontSize: 15,
    color: '#000',
  },
});
