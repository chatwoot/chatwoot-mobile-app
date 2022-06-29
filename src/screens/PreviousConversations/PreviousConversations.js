/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { Spinner, withStyles } from '@ui-kitten/components';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView, ScrollView, View, Text } from 'react-native';

import HeaderBar from '../../components/HeaderBar';
import i18n from '../../i18n';
import styles from './PreviousConversations.styles';
import { loadInitialMessage, setConversation } from 'src/actions/conversation';
import { getContactConversations } from '../../actions/contact';
import ConversationItem from 'src/screens/ConversationList/components/ConversationItem';

const PreviousConversationsScreenComponent = ({ eva: { style }, navigation, route }) => {
  const { conversationDetails } = route.params;
  const {
    id: conversationId,
    meta: {
      sender: { id: contactId },
    },
  } = conversationDetails;

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getContactConversations(contactId));
  }, [contactId, dispatch]);

  const inboxes = useSelector(state => state.inbox.data);
  const conversationTypingUsers = useSelector(state => state.conversation.conversationTypingUsers);
  const conversations = useSelector(state => state.conversation);
  const { isPreviousConversationsLoading } = conversations;

  const contactConversations =
    conversations &&
    conversations.contactConversations &&
    conversations.contactConversations.payload;

  const goBack = () => {
    navigation.goBack();
  };

  const previousConversations =
    contactConversations &&
    contactConversations.filter(conversation => conversation.id !== Number(conversationId));

  const onSelectConversation = item => {
    const { messages, meta } = item;
    const chatId = item.id;
    dispatch(setConversation({ chatId }));
    dispatch(loadInitialMessage({ messages }));
    navigation.navigate('ChatScreen', {
      chatId,
      meta,
      messages,
    });
  };

  const showEmptyList =
    previousConversations && previousConversations.length === 0 && !isPreviousConversationsLoading;

  return (
    <SafeAreaView style={style.container}>
      <HeaderBar
        title={i18n.t('PREVIOUS_CONVERSATION.TITLE')}
        showLeftButton
        onBackPress={goBack}
      />
      <ScrollView>
        {previousConversations &&
          previousConversations.map(conversation => (
            <ConversationItem
              item={conversation}
              onSelectConversation={onSelectConversation}
              inboxes={inboxes}
              conversationTypingUsers={conversationTypingUsers}
              hasThumbnail={false}
            />
          ))}
        {isPreviousConversationsLoading && (
          <View style={style.spinnerView}>
            <Spinner size="medium" />
          </View>
        )}
        {showEmptyList ? (
          <View>
            <Text style={style.emptyList}>{i18n.t('PREVIOUS_CONVERSATION.EMPTY')}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const PreviousConversationsScreen = withStyles(PreviousConversationsScreenComponent, styles);
export default PreviousConversationsScreen;
