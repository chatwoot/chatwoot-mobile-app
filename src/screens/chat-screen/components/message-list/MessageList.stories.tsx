import { Meta, StoryObj } from '@storybook/react';
import { ScrollView } from 'react-native';
import { Platform } from 'react-native';
import { KeyboardGestureArea, KeyboardProvider } from 'react-native-keyboard-controller';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Animated } from 'react-native';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { tailwind } from '@/theme';
import { MessagesList } from './MessagesList';
import { LightBoxProvider } from '@alantoa/lightbox';
import { ALL_MESSAGES_MOCKDATA } from './mock-data/MessagesListMockdata';
import { ChatWindowProvider, RefsProvider } from '@/context';
import { Provider } from 'react-redux';

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
    ids: [29],
    entities: {
      29: {
        id: 29,
        status: 'open',
        messages: ALL_MESSAGES_MOCKDATA,
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

export const AllMessageTypes: Story = {
  render: function AllVariantsComponent() {
    return (
      <Provider store={mockStore}>
        <BottomSheetModalProvider>
          <RefsProvider>
            <KeyboardProvider>
              <LightBoxProvider>
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
                      />
                    </PlatformSpecificKeyboardWrapperComponent>
                  </ScrollView>
                </ChatWindowProvider>
              </LightBoxProvider>
            </KeyboardProvider>
          </RefsProvider>
        </BottomSheetModalProvider>
      </Provider>
    );
  },
};
