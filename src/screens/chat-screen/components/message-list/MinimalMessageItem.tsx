import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Message } from '@/types';
import { MESSAGE_TYPES } from '@/constants';

interface MinimalMessageItemProps {
  message: Message;
  currentUserId: number;
}

/**
 * MINIMAL Message Item - Ultra Simple, Cannot Crash
 * 
 * Strategy: Strip everything down to absolute basics
 * - No bubble components
 * - No complex logic
 * - Just simple left/right text rendering
 * - Once this works, we add complexity back slowly
 */
const MinimalMessageItem: React.FC<MinimalMessageItemProps> = memo(
  ({ message, currentUserId }) => {
    // Triple layer safety
    try {
      if (!message) return <View style={{ height: 0 }} />;
      if (!message.id) return <View style={{ height: 0 }} />;

      const isMyMessage = message.senderId === currentUserId;
      const isActivity = message.messageType === MESSAGE_TYPES.ACTIVITY;

      // Activity messages - centered
      if (isActivity) {
        return (
          <View style={styles.activityContainer}>
            <View style={styles.activityBubble}>
              <Text style={styles.activityText}>
                {message.content || 'Activity'}
              </Text>
            </View>
          </View>
        );
      }

      // Regular messages - left or right aligned
      return (
        <View style={[styles.messageContainer, isMyMessage ? styles.myMessage : styles.otherMessage]}>
          <View style={[styles.bubble, isMyMessage ? styles.myBubble : styles.otherBubble]}>
            <Text style={[styles.messageText, isMyMessage ? styles.myText : styles.otherText]}>
              {message.content || '[No content]'}
            </Text>
            <Text style={styles.timestamp}>
              {new Date(message.createdAt * 1000).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        </View>
      );
    } catch (error) {
      console.error('[MinimalMessageItem] Render error:', error);
      return <View style={{ height: 0 }} />;
    }
  },
  (prev, next) => {
    try {
      return prev.message?.id === next.message?.id;
    } catch {
      return false;
    }
  }
);

MinimalMessageItem.displayName = 'MinimalMessageItem';

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 2,
    paddingHorizontal: 12,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myText: {
    color: '#000',
  },
  otherText: {
    color: '#000',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  activityContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  activityBubble: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activityText: {
    fontSize: 13,
    color: '#666',
  },
});

export default MinimalMessageItem;
