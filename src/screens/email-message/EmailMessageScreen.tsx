import { useTailwind } from '@/theme/useTailwind';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackActions, useNavigation, useRoute } from '@react-navigation/native';

import { Icon } from '@/components-next';
import { MESSAGE_VARIANTS } from '@/constants';
import { useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import { PaneHeader } from '@/navigation/split/PaneHeader';
import { FullScreenPage } from '@/navigation/split/FullScreenPage';
import { PageHeader } from '@/navigation/split/PageHeader';
import type { EmailColumnParams } from '@/navigation/split/SplitViewContext';
import { EmailMeta } from '@/screens/chat-screen/components/message-components/EmailMeta';
import { MarkdownBubble } from '@/screens/chat-screen/components/message-components/MarkdownBubble';
import { getMessagesByConversationId } from '@/store/conversation/conversationSelectors';
import { CloseIcon } from '@/svg-icons';
import { IOS_DESIGN } from '@/utils';
import { getEmailHtml, getEmailStyle, isOutgoingMarkdownEmail } from '@/utils/emailUtils';
import { openURL } from '@/utils/urlUtils';

type EmailMessageScreenProps = {
  paneParams?: EmailColumnParams;
};

const LOCAL_URL = /^(about:|data:)/;
const EMAIL_BACKGROUND = '#ffffff';

const handleLinkRequest = (request: ShouldStartLoadRequest) => {
  if (LOCAL_URL.test(request.url)) {
    return true;
  }
  openURL({ URL: request.url });
  return false;
};

const EmailMessageScreen = ({ paneParams }: EmailMessageScreenProps = {}) => {
  const tailwind = useTailwind();
  const { top } = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const { conversationId, messageId } = (paneParams ?? route.params) as EmailColumnParams;
  const messages = useAppSelector(state => getMessagesByConversationId(state, { conversationId }));
  const message = messages.find(item => item.id === messageId);
  const contentAttributes = message?.contentAttributes;
  const title =
    contentAttributes?.email?.subject || i18n.t('CONVERSATION.EMAIL_HEADER.FULL_EMAIL_TITLE');

  const handleBackPress = () => {
    navigation.dispatch(StackActions.pop());
  };

  const meta = message && contentAttributes && (
    <EmailMeta contentAttributes={contentAttributes} sender={message.sender} />
  );

  let body: React.ReactNode = null;
  if (message && isOutgoingMarkdownEmail(message)) {
    body = (
      <ScrollView contentContainerStyle={tailwind.style('px-4 pt-2 pb-10 gap-3')}>
        {meta}
        <MarkdownBubble messageContent={message.content} variant={MESSAGE_VARIANTS.EMAIL} />
      </ScrollView>
    );
  } else if (message) {
    body = (
      <View style={tailwind.style('flex-1')}>
        {meta ? <View style={tailwind.style('px-4 pt-2 pb-3')}>{meta}</View> : null}
        <WebView
          style={[tailwind.style('flex-1'), { backgroundColor: EMAIL_BACKGROUND }]}
          originWhitelist={['*']}
          forceDarkOn={false}
          autoManageStatusBarEnabled={false}
          onShouldStartLoadWithRequest={handleLinkRequest}
          source={{
            html: `<meta name="viewport" content="width=device-width, initial-scale=1"><style>${getEmailStyle(
              message,
              tailwind.isDark,
            )} body { margin: 0; padding: 12px 16px 40px; }</style>${getEmailHtml(message)}`,
          }}
        />
      </View>
    );
  }

  if (IOS_DESIGN && !paneParams) {
    return (
      <FullScreenPage>
        <PageHeader title={title} onBack={handleBackPress} />
        {body}
      </FullScreenPage>
    );
  }

  if (paneParams) {
    return (
      <View style={tailwind.style('flex-1')}>
        <PaneHeader title={title} />
        {body}
      </View>
    );
  }

  return (
    <View style={tailwind.style('flex-1 bg-white', `pt-[${top}px]`)}>
      <View
        style={tailwind.style(
          'flex flex-row items-center justify-between px-4 border-b-[1px] border-b-blackA-A3 py-[12px]',
        )}>
        <Pressable
          hitSlop={16}
          onPress={handleBackPress}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('CONVERSATION.HEADER.BACK')}>
          <Icon icon={<CloseIcon />} size={24} />
        </Pressable>
        <Text
          numberOfLines={1}
          style={tailwind.style(
            'flex-1 mx-3 text-center text-[17px] font-inter-medium-24 tracking-[0.32px] text-gray-950',
          )}>
          {title}
        </Text>
        <View style={tailwind.style('w-6')} />
      </View>
      {body}
    </View>
  );
};

export default EmailMessageScreen;
