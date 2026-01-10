import React, { useCallback } from 'react';
import { FlatList, View, Text, StyleSheet, Linking } from 'react-native';
import { Message } from '@/types';
import { MESSAGE_TYPES, SENDER_TYPES, MESSAGE_STATUS } from '@/constants';

interface BareMessagesListProps {
  messages: (Message | { date: string })[];
  onEndReached: () => void;
  currentUserId: number;
}

/**
 * Stable Messages List - Plain FlatList, WhatsApp-like styling
 * 
 * NO FlashList (causes crashes)
 * NO Reanimated (causes crashes)
 * Plain React Native for stability
 */
export const BareMessagesList: React.FC<BareMessagesListProps> = ({
  messages,
  onEndReached,
  currentUserId,
}) => {

  // Format timestamp
  const formatTime = (timestamp: number) => {
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Get status indicator
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case MESSAGE_STATUS.PROGRESS: return '🕐';
      case MESSAGE_STATUS.SENT: return '✓';
      case MESSAGE_STATUS.DELIVERED: return '✓✓';
      case MESSAGE_STATUS.READ: return '✓✓';
      default: return '';
    }
  };

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

      // Activity message - centered
      if (item.messageType === MESSAGE_TYPES.ACTIVITY) {
        return (
          <View style={styles.activityContainer}>
            <View style={styles.activityBubble}>
              <Text style={styles.activityText}>{item.content || 'Activity'}</Text>
              <Text style={styles.activityTime}>{formatTime(item.createdAt)}</Text>
            </View>
          </View>
        );
      }

      // Determine if this is the user's own message
      const senderId = item.senderId ?? item.sender?.id;
      const senderType = item.senderType ?? item.sender?.type;
      
      // User's outgoing message (agent side)
      const isOutgoing = item.messageType === MESSAGE_TYPES.OUTGOING;
      const isFromCurrentUser = senderType?.toLowerCase() === SENDER_TYPES.USER.toLowerCase() && 
                                 currentUserId === senderId;
      const isMyMessage = isOutgoing || isFromCurrentUser;

      // Get sender name for received messages
      const senderName = item.sender?.name || '';
      
      return (
        <View style={[styles.msgContainer, isMyMessage ? styles.myMsg : styles.otherMsg]}>
          {/* Sender name for received messages */}
          {!isMyMessage && senderName && !item.groupWithPrevious && (
            <Text style={styles.senderName}>{senderName}</Text>
          )}
          
          <View style={[styles.bubble, isMyMessage ? styles.myBubble : styles.otherBubble]}>
            {/* Message content */}
            <Text style={[styles.msgText, isMyMessage ? styles.myMsgText : styles.otherMsgText]}>
              {item.content || '[No content]'}
            </Text>
            
            {/* Footer: Time + Status */}
            <View style={styles.msgFooter}>
              <Text style={[styles.msgTime, isMyMessage ? styles.myMsgTime : styles.otherMsgTime]}>
                {formatTime(item.createdAt)}
              </Text>
              {isMyMessage && (
                <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
              )}
            </View>
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
    backgroundColor: '#ECE5DD',
  },
  content: {
    padding: 12,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateBadge: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  activityContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  activityBubble: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    maxWidth: '85%',
  },
  activityText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  activityTime: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
  },
  msgContainer: {
    marginVertical: 2,
    paddingHorizontal: 4,
  },
  myMsg: {
    alignItems: 'flex-end',
  },
  otherMsg: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#075E54',
    fontWeight: '600',
    marginBottom: 2,
    marginLeft: 4,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  myBubble: {
    backgroundColor: '#DCF8C6',
    borderTopRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
  },
  msgText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMsgText: {
    color: '#000',
  },
  otherMsgText: {
    color: '#000',
  },
  msgFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  msgTime: {
    fontSize: 11,
  },
  myMsgTime: {
    color: '#6B8E6B',
  },
  otherMsgTime: {
    color: '#999',
  },
  statusIcon: {
    fontSize: 12,
    marginLeft: 4,
    color: '#6B8E6B',
  },
});
