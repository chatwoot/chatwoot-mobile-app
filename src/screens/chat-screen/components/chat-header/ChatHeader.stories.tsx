import { Meta, StoryObj } from '@storybook/react';
import { ChatHeader } from './ChatHeader';
import { tailwind } from '@/theme';
import { ScrollView, View, Text } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { RefsProvider } from '@/context';

const meta: Meta<typeof ChatHeader> = {
  title: 'Chat Header',
  component: ChatHeader,
  args: {
    name: 'John Doe',
    imageSrc: { uri: 'https://i.pravatar.cc/300' },
    isResolved: false,
    dashboardsList: [
      { title: 'Dashboard 1', onSelect: () => {} },
      { title: 'Dashboard 2', onSelect: () => {} },
    ],
    onBackPress: () => {},
    onContactDetailsPress: () => {},
    onToggleChatStatus: () => {},
  },
  decorators: [
    Story => (
      <View style={tailwind.style('bg-white')}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatHeader>;

export const Default: Story = {
  args: {
    name: 'John Doe',
    isResolved: false,
  },
};

const Title = ({ title }: { title: string }) => (
  <View style={tailwind.style('flex items-center justify-center py-2')}>
    <Text style={tailwind.style('text-md font-medium italic text-gray-800')}>{title}</Text>
  </View>
);

const HeaderContainer = ({ children }: { children: React.ReactNode }) => (
  <BottomSheetModalProvider>
    <RefsProvider>
      <View style={tailwind.style('flex-1')}>{children}</View>
    </RefsProvider>
  </BottomSheetModalProvider>
);

export const AllVariants: Story = {
  render: () => (
    <ScrollView contentContainerStyle={tailwind.style('flex gap-4')}>
      <Title title="Default Chat" />
      <HeaderContainer>
        <ChatHeader
          name="John Doe"
          imageSrc={{ uri: 'https://i.pravatar.cc/300' }}
          isResolved={false}
          dashboardsList={[
            { title: 'Dashboard 1', onSelect: () => {} },
            { title: 'Dashboard 2', onSelect: () => {} },
          ]}
          onBackPress={() => {}}
          onContactDetailsPress={() => {}}
          onToggleChatStatus={() => {}}
        />
      </HeaderContainer>

      <Title title="Resolved Chat" />
      <HeaderContainer>
        <ChatHeader
          name="Jane Smith"
          imageSrc={{ uri: 'https://i.pravatar.cc/300' }}
          isResolved={true}
          dashboardsList={[
            { title: 'Dashboard 1', onSelect: () => {} },
            { title: 'Dashboard 2', onSelect: () => {} },
          ]}
          onBackPress={() => {}}
          onContactDetailsPress={() => {}}
          onToggleChatStatus={() => {}}
        />
      </HeaderContainer>

      <Title title="Long Name Chat" />
      <HeaderContainer>
        <ChatHeader
          name="This is a very long name that should be truncated properly in the UI"
          imageSrc={{ uri: 'https://i.pravatar.cc/300' }}
          isResolved={false}
          dashboardsList={[
            { title: 'Dashboard 1', onSelect: () => {} },
            { title: 'Dashboard 2', onSelect: () => {} },
          ]}
          onBackPress={() => {}}
          onContactDetailsPress={() => {}}
          onToggleChatStatus={() => {}}
        />
      </HeaderContainer>

      <Title title="SLA Missed Chat" />
      <HeaderContainer>
        <ChatHeader
          name="This is a very long name that should be truncated properly in the UI"
          imageSrc={{ uri: 'https://i.pravatar.cc/300' }}
          isResolved={false}
          dashboardsList={[
            { title: 'Dashboard 1', onSelect: () => {} },
            { title: 'Dashboard 2', onSelect: () => {} },
          ]}
          onBackPress={() => {}}
          onContactDetailsPress={() => {}}
          onToggleChatStatus={() => {}}
          isSlaMissed={true}
          hasSla={true}
        />
      </HeaderContainer>

      <Title title="Missed SLA" />
      <HeaderContainer>
        <ChatHeader
          name="This is a very long name that should be truncated properly in the UI"
          imageSrc={{ uri: 'https://i.pravatar.cc/300' }}
          isResolved={false}
          dashboardsList={[
            { title: 'Dashboard 1', onSelect: () => {} },
            { title: 'Dashboard 2', onSelect: () => {} },
          ]}
          onBackPress={() => {}}
          onContactDetailsPress={() => {}}
          onToggleChatStatus={() => {}}
          isSlaMissed={false}
          hasSla={true}
        />
      </HeaderContainer>
    </ScrollView>
  ),
};
