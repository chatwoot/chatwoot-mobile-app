import { Meta, StoryObj } from '@storybook/react';
import { InboxHeader } from '../InboxHeader';
import { tailwind } from '@/theme';
import { ScrollView, View, Text } from 'react-native';

const meta: Meta<typeof InboxHeader> = {
  title: 'Inbox Screen Header',
  component: InboxHeader,
  args: {
    markAllAsRead: () => {},
  },
  decorators: [
    Story => (
      <View style={tailwind.style('border-b-[1px] border-blackA-A3')}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof InboxHeader>;

export const Default: Story = {
  args: {},
};

const Title = ({ title }: { title: string }) => (
  <View style={tailwind.style('flex items-center justify-center')}>
    <Text style={tailwind.style('text-md font-medium italic text-gray-800')}>{title}</Text>
  </View>
);

const HeaderContainer = ({ children }: { children: React.ReactNode }) => (
  <View style={tailwind.style('flex-1 border-b-[1px] border-blackA-A3')}>{children}</View>
);

export const AllVariants: Story = {
  render: () => (
    <ScrollView contentContainerStyle={tailwind.style('flex gap-4 pt-4')}>
      <Title title="Default State" />
      <HeaderContainer>
        <InboxHeader markAllAsRead={() => {}} />
      </HeaderContainer>
    </ScrollView>
  ),
};
