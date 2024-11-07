import { format } from 'date-fns';
import { groupBy } from 'lodash';
import { create } from 'zustand';

import { Message, UnixTimestamp } from '../types';

function formatDate(timestamp: UnixTimestamp): string {
  const messageDate = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
  const currentDate = new Date();

  const formatString =
    messageDate.getFullYear() !== currentDate.getFullYear() ? 'MMM dd, yyyy' : 'MMM dd';

  return format(messageDate, formatString);
}

type SectionGroupMessages = {
  data: Message[];
  date: string;
};

export const getGroupedMessages = (messages: Message[]): SectionGroupMessages[] => {
  const conversationGroupedByDate = groupBy(Object.values(messages), (message: Message) =>
    formatDate(message.createdAt),
  );
  return Object.keys(conversationGroupedByDate).map(date => {
    const groupedMessages = conversationGroupedByDate[date].map(
      (message: Message, index: number) => {
        let shouldRenderAvatar = false;
        if (index === conversationGroupedByDate[date].length - 1) {
          shouldRenderAvatar = true;
        } else {
          const nextMessage = conversationGroupedByDate[date][index + 1];
          const currentSender = message.sender ? message.sender.name : '';
          const nextSender = nextMessage.sender ? nextMessage.sender.name : '';
          shouldRenderAvatar =
            currentSender !== nextSender || message.messageType !== nextMessage.messageType;
        }
        return { shouldRenderAvatar, ...message };
      },
    );

    return {
      data: groupedMessages,
      date,
    };
  });
};

export type MessageListState = {
  messageList: SectionGroupMessages[];
  setMessageList: (messageList: Message[]) => void;
  addNewMessage: (message: Message) => void;
};

export const useMessageList = create<MessageListState>(set => ({
  messageList: [],
  setMessageList: messageList => {
    const formattedList = getGroupedMessages(messageList);
    set(state => ({ ...state, messageList: formattedList }));
  },
  addNewMessage: message => {
    set(state => {
      const newMessageDate = formatDate(message.createdAt);
      let updatedMessageList = [...state.messageList];

      // Find or create the group for the new message date
      let messageGroup = updatedMessageList.find(group => group.date === newMessageDate);
      if (messageGroup) {
        // Add the new message to the existing group
        messageGroup.data.push(message);
      } else {
        // Create a new group for the new message
        messageGroup = {
          date: newMessageDate,
          data: [message],
        };
        updatedMessageList.unshift(messageGroup);
      }

      // Sort the messages within the group in descending order by timestamp
      messageGroup.data.sort((a, b) => b.createdAt - a.createdAt);

      // Update shouldRenderAvatar for each message in the group
      messageGroup.data.forEach((msg, index, arr) => {
        let shouldRenderAvatar = index === 0; // Always render for the first message in the group
        if (index > 0) {
          const previousMessage = arr[index - 1];
          shouldRenderAvatar =
            !previousMessage.sender ||
            previousMessage.sender.name !== msg.sender.name ||
            previousMessage.messageType !== msg.messageType;
        }
        msg.shouldRenderAvatar = shouldRenderAvatar;
      });

      return { ...state, messageList: updatedMessageList };
    });
  },
}));
