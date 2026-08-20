import { Meta, StoryObj } from '@storybook/react';
import { ScrollView } from 'react-native';
import { Platform } from 'react-native';
import { KeyboardGestureArea, KeyboardProvider } from 'react-native-keyboard-controller';
import { Animated } from 'react-native';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { tailwind } from '@/theme';
import { MessagesList } from '../MessagesList';
import { EMAIL_MESSAGES } from './mock-data/simpleEmail';
import { EMAIL_ATTACHMENTS } from './mock-data/emailAttachments';
import { ChatWindowProvider, RefsProvider } from '@/context';
import { Provider } from 'react-redux';
import { getAllGroupedMessages } from './mock-data/helper';
const ALL_MESSAGES_MOCKDATA = getAllGroupedMessages(EMAIL_MESSAGES);
const EMAIL_ATTACHMENTS_MOCKDATA = getAllGroupedMessages(EMAIL_ATTACHMENTS);

const PlatformSpecificKeyboardWrapperComponent =
  Platform.OS === 'android' ? Animated.View : KeyboardGestureArea;

const mockSendMessageSlice = createSlice({
  name: 'sendMessage',
  initialState: {
    messageContent: '',
    isPrivateMessage: false,
    attachments: [],
    quoteMessage: null,
  },
  reducers: {},
});

const mockConversationSlice = createSlice({
  name: 'conversation',
  initialState: {
    ids: [29, 134],
    entities: {
      29: {
        id: 29,
        status: 'open',
        channel: 'Channel::Email',
        messages: ALL_MESSAGES_MOCKDATA,
      },
      134: {
        id: 134,
        status: 'open',
        channel: 'Channel::Email',
        messages: EMAIL_ATTACHMENTS_MOCKDATA,
      },
    },
  },
  reducers: {},
});

const mockStore = configureStore({
  reducer: {
    sendMessage: mockSendMessageSlice.reducer,
    conversations: mockConversationSlice.reducer,
  },
});

const meta: Meta<typeof MessagesList> = {
  title: 'Messages List',
  component: MessagesList,
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof MessagesList>;

export const EmailMessageList: Story = {
  render: function AllVariantsComponent() {
    return (
      <Provider store={mockStore}>
        <RefsProvider>
            <KeyboardProvider>
              <ChatWindowProvider conversationId={29}>
                <ScrollView contentContainerStyle={tailwind.style('flex')}>
                  <PlatformSpecificKeyboardWrapperComponent
                    style={tailwind.style('flex-1 bg-white')}
                    interpolator="linear">
                    <MessagesList
                      messages={ALL_MESSAGES_MOCKDATA}
                      isFlashListReady={false}
                      setFlashListReady={() => {}}
                      onEndReached={() => {}}
                      onStartReached={() => {}}
                      isEmailInbox={true}
                      currentUserId={1}
                    />
                  </PlatformSpecificKeyboardWrapperComponent>
                </ScrollView>
              </ChatWindowProvider>
            </KeyboardProvider>
        </RefsProvider>
      </Provider>
    );
  },
};

export const EmailAttachmentsList: Story = {
  render: function EmailAttachmentsComponent() {
    return (
      <Provider store={mockStore}>
        <RefsProvider>
          <KeyboardProvider>
            <ChatWindowProvider conversationId={134}>
              <ScrollView contentContainerStyle={tailwind.style('flex')}>
                <PlatformSpecificKeyboardWrapperComponent
                  style={tailwind.style('flex-1 bg-white')}
                  interpolator="linear">
                  <MessagesList
                    messages={EMAIL_ATTACHMENTS_MOCKDATA}
                    isFlashListReady={false}
                    setFlashListReady={() => {}}
                    onEndReached={() => {}}
                    onStartReached={() => {}}
                    isEmailInbox={true}
                    currentUserId={1}
                  />
                </PlatformSpecificKeyboardWrapperComponent>
              </ScrollView>
            </ChatWindowProvider>
          </KeyboardProvider>
        </RefsProvider>
      </Provider>
    );
  },
};
