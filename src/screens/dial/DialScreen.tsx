import React, { useEffect, useMemo, useState } from 'react';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { StackActions, useNavigation } from '@react-navigation/native';
import { Pressable, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components-next';
import { TAB_BAR_HEIGHT } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import { ContactableInboxSelectorSheet } from '@/screens/common/ContactableInboxSelectorSheet';
import { VoiceInboxSelectorSheet } from '@/screens/common/VoiceInboxSelectorSheet';
import { handleContactPress } from '@/screens/search/utils/handlers';
import { selectUserId } from '@/store/auth/authSelectors';
import { contactActions } from '@/store/contact/contactActions';
import { addContact, addContacts } from '@/store/contact/contactSlice';
import { selectAllContacts } from '@/store/contact/contactSelectors';
import { ContactService } from '@/store/contact/contactService';
import type { ContactableInbox } from '@/store/contact/contactTypes';
import { conversationActions } from '@/store/conversation/conversationActions';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import { SearchIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import type { Contact } from '@/types/Contact';
import type { Inbox } from '@/types/Inbox';
import { isVoiceCallEnabled } from '@/utils/inboxUtils';
import { showToast } from '@/utils/toastUtils';
import { CallActionButton } from './components/CallActionButton';
import { DialContactMatch } from './components/DialContactMatch';
import { DialContactSearchSheet } from './components/DialContactSearchSheet';
import { DialKey, KEYPAD_WIDTH } from './components/DialKey';
import { DialMessageActionButton } from './components/DialMessageActionButton';
import { findExactPhoneContact } from './utils/contactMatching';
import {
  digitsOnly,
  formatDialedNumber,
  isCompleteDialedNumber,
  normalizeDialedNumber,
  sanitizeDialedNumber,
} from './utils/phoneNumberUtils';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
const CONTACT_SEARCH_MIN_DIGITS = 3;
const CONTACT_SEARCH_DEBOUNCE_MS = 300;

export const DialScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const currentUserId = useAppSelector(selectUserId);
  const contacts = useAppSelector(selectAllContacts);
  const inboxes = useAppSelector(selectAllInboxes);
  const [dialedNumber, setDialedNumber] = useState('');
  const [searchedContacts, setSearchedContacts] = useState<Contact[]>([]);
  const [selectedVoiceInboxId, setSelectedVoiceInboxId] = useState<number>();
  const [voiceSelectorVisible, setVoiceSelectorVisible] = useState(false);
  const [messageSelectorVisible, setMessageSelectorVisible] = useState(false);
  const [messageContact, setMessageContact] = useState<Contact>();
  const [messageInboxes, setMessageInboxes] = useState<ContactableInbox[]>([]);
  const [isLoadingMessageInboxes, setIsLoadingMessageInboxes] = useState(false);
  const [isStartingCall, setIsStartingCall] = useState(false);
  const [isStartingMessage, setIsStartingMessage] = useState(false);
  const [contactSearchVisible, setContactSearchVisible] = useState(false);

  const voiceInboxes = useMemo(
    () =>
      inboxes
        .filter(isVoiceCallEnabled)
        .sort((current, next) => current.name.localeCompare(next.name)),
    [inboxes],
  );

  useEffect(() => {
    if (!selectedVoiceInboxId && voiceInboxes.length) {
      setSelectedVoiceInboxId(voiceInboxes[0].id);
    }
  }, [selectedVoiceInboxId, voiceInboxes]);

  const selectedVoiceInbox = voiceInboxes.find(inbox => inbox.id === selectedVoiceInboxId);
  const dialedDigits = digitsOnly(dialedNumber);
  const localMatchedContact = findExactPhoneContact(contacts, dialedNumber);
  const searchedMatchedContact = findExactPhoneContact(searchedContacts, dialedNumber);
  const matchedContact = localMatchedContact || searchedMatchedContact;
  const normalizedNumber = normalizeDialedNumber(dialedNumber);
  const hasCompleteNumber = isCompleteDialedNumber(dialedNumber);
  const isStartingAction = isStartingCall || isStartingMessage;
  const canCall = !!selectedVoiceInbox && hasCompleteNumber && !isStartingAction;
  const canMessage = hasCompleteNumber && !isStartingAction;
  const formattedNumber = formatDialedNumber(dialedNumber);
  const selectedVoiceInboxTitle = selectedVoiceInbox?.name || i18n.t('DIAL.NO_VOICE_INBOX');

  useEffect(() => {
    if (dialedDigits.length < CONTACT_SEARCH_MIN_DIGITS || localMatchedContact) {
      setSearchedContacts([]);
      return undefined;
    }

    let cancelled = false;
    const searchTimer = setTimeout(async () => {
      try {
        const response = await dispatch(
          contactActions.getContacts({
            page: 1,
            query: dialedDigits,
            sort: 'name',
          }),
        ).unwrap();
        const fetchedContacts = response.payload || [];

        if (!cancelled) {
          setSearchedContacts(fetchedContacts);
          dispatch(addContacts({ contacts: fetchedContacts }));
        }
      } catch {
        if (!cancelled) {
          setSearchedContacts([]);
        }
      }
    }, CONTACT_SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(searchTimer);
    };
  }, [dialedDigits, dispatch, localMatchedContact]);

  const appendDigit = (value: string) => {
    setDialedNumber(current => `${current}${value}`);
  };

  const updateDialedNumber = (value: string) => {
    setDialedNumber(sanitizeDialedNumber(value));
  };

  const deleteDigit = () => {
    setDialedNumber(current => current.slice(0, -1));
  };

  const selectVoiceInbox = (inbox: Inbox) => {
    setSelectedVoiceInboxId(inbox.id);
  };

  const openContact = (contact: Contact) => {
    void handleContactPress(navigation, contact, dispatch);
  };

  const selectSearchContact = (contact: Contact) => {
    if (contact.phoneNumber) {
      setDialedNumber(contact.phoneNumber);
      return;
    }

    showToast({ message: i18n.t('DIAL.CONTACT_PHONE_REQUIRED') });
    openContact(contact);
  };

  const resolveDialContact = async () => {
    let contact = matchedContact;

    if (!contact) {
      const response = await dispatch(
        contactActions.getContacts({
          page: 1,
          query: dialedDigits,
          sort: 'name',
        }),
      ).unwrap();
      const fetchedContacts = response.payload || [];
      dispatch(addContacts({ contacts: fetchedContacts }));
      contact = findExactPhoneContact(fetchedContacts, dialedNumber);
    }

    if (contact) {
      return contact;
    }

    const createdContact = await dispatch(
      contactActions.createContact({
        name: normalizedNumber,
        phoneNumber: normalizedNumber,
      }),
    ).unwrap();
    dispatch(addContact(createdContact));
    return createdContact;
  };

  const enrichContactableInboxes = (payload: ContactableInbox[]) => {
    return payload.map(contactableInbox => {
      const cachedInbox = inboxes.find(inbox => inbox.id === contactableInbox.id);

      if (!cachedInbox) {
        return contactableInbox;
      }

      return {
        ...cachedInbox,
        ...contactableInbox,
        avatarUrl: contactableInbox.avatarUrl || cachedInbox.avatarUrl,
        channelId: contactableInbox.channelId || cachedInbox.channelId,
        channelType: contactableInbox.channelType || cachedInbox.channelType,
        email: contactableInbox.email || cachedInbox.email,
        medium: contactableInbox.medium || cachedInbox.medium,
        phoneNumber: contactableInbox.phoneNumber || cachedInbox.phoneNumber,
        provider: contactableInbox.provider || cachedInbox.provider,
        additionalAttributes: {
          ...(cachedInbox.additionalAttributes || {}),
          ...(contactableInbox.additionalAttributes || {}),
        },
      };
    });
  };

  const messageCapableInboxes = (payload: ContactableInbox[]) => {
    return payload.filter(inbox => inbox.channelType !== 'Channel::Email');
  };

  const openMessageConversationForInbox = async (inbox: ContactableInbox) => {
    if (!messageContact || isStartingAction) {
      return;
    }

    setIsStartingMessage(true);

    try {
      const response = await dispatch(
        conversationActions.createConversation({
          contactId: messageContact.id,
          inboxId: inbox.id,
          sourceId: inbox.sourceId || messageContact.phoneNumber || normalizedNumber,
          assigneeId: currentUserId,
        }),
      ).unwrap();

      setMessageSelectorVisible(false);
      navigation.dispatch(
        StackActions.push('ChatScreen', {
          conversationId: response.conversation.id,
        }),
      );
    } catch {
      showToast({ message: i18n.t('CONTACT_DETAILS.OPEN_CONVERSATION_FAILED') });
    } finally {
      setIsStartingMessage(false);
    }
  };

  const openMessageInboxSelector = async () => {
    if (!hasCompleteNumber || isStartingAction) {
      return;
    }

    setMessageSelectorVisible(true);
    setIsLoadingMessageInboxes(true);

    try {
      const contact = await resolveDialContact();
      setMessageContact(contact);
      const response = await ContactService.getContactableInboxes(contact.id);
      setMessageInboxes(messageCapableInboxes(enrichContactableInboxes(response.payload)));
    } catch {
      setMessageSelectorVisible(false);
      showToast({ message: i18n.t('CONTACT_DETAILS.OPEN_CONVERSATION_FAILED') });
    } finally {
      setIsLoadingMessageInboxes(false);
    }
  };

  const startCall = async () => {
    if (!selectedVoiceInbox || !hasCompleteNumber || isStartingAction) {
      return;
    }

    setIsStartingCall(true);

    try {
      const callableContact = await resolveDialContact();
      await dispatch(
        contactActions.startContactCall({
          contactId: callableContact.id,
          inboxId: selectedVoiceInbox.id,
        }),
      ).unwrap();
    } finally {
      setIsStartingCall(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
      <View style={tailwind.style('flex-row items-center px-4 pt-2 pb-[12px]')}>
        <View style={tailwind.style('w-12')} />
        <Pressable
          accessibilityRole="button"
          onPress={() => setVoiceSelectorVisible(true)}
          style={({ pressed }) =>
            tailwind.style('flex-1 min-w-0 px-3', pressed ? 'opacity-60' : '')
          }>
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style(
              'text-center text-[17px] font-inter-medium-24 leading-[21px] tracking-[0.32px] text-gray-950',
            )}>
            {selectedVoiceInboxTitle}
          </Animated.Text>
        </Pressable>
        <View style={tailwind.style('w-12')} />
      </View>

      <View style={tailwind.style(`flex-1 px-6 pb-[${TAB_BAR_HEIGHT + 14}px]`)}>
        <Pressable
          accessibilityRole="search"
          accessibilityLabel={i18n.t('DIAL.SEARCH_CONTACT')}
          onPress={() => setContactSearchVisible(true)}
          style={({ pressed }) =>
            tailwind.style(
              '-mx-2 h-10 flex-row items-center rounded-[13px] border border-gray-100 bg-gray-50 px-3',
              pressed ? 'bg-gray-100' : '',
            )
          }>
          <Icon icon={<SearchIcon />} size={20} style={tailwind.style('mr-2')} />
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style(
              'flex-1 text-base font-inter-normal-20 leading-[22px] text-gray-700',
            )}>
            {i18n.t('DIAL.SEARCH_CONTACT_PLACEHOLDER')}
          </Animated.Text>
        </Pressable>

        <View style={tailwind.style('flex-1 pt-5')}>
          <View style={tailwind.style('items-center')}>
            <View style={tailwind.style('h-[92px] items-center justify-center')}>
              <TextInput
                value={formattedNumber}
                onChangeText={updateDialedNumber}
                placeholder={i18n.t('DIAL.ENTER_NUMBER')}
                placeholderTextColor={tailwind.color('text-gray-950')}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoCorrect={false}
                autoCapitalize="none"
                caretHidden
                showSoftInputOnFocus={false}
                selectTextOnFocus={false}
                maxLength={24}
                numberOfLines={1}
                style={tailwind.style(
                  'h-[54px] w-full text-center text-[34px] font-inter-420-20 leading-[42px] text-gray-950',
                )}
              />
              <View style={tailwind.style('h-[30px] justify-center pt-1')}>
                <DialContactMatch
                  contact={matchedContact}
                  hasDialedNumber={!!dialedDigits}
                  onPress={openContact}
                />
              </View>
            </View>

            <View
              style={tailwind.style(
                `mt-4 w-[${KEYPAD_WIDTH}px] flex-row flex-wrap gap-4 justify-center`,
              )}>
              {KEYS.map(key => (
                <DialKey key={key} value={key} onPress={appendDigit} />
              ))}
            </View>
          </View>

          <View style={tailwind.style('mt-6 items-center')}>
            <View style={tailwind.style('h-[70px] flex-row items-center justify-center gap-8')}>
              <DialMessageActionButton disabled={!canMessage} onPress={openMessageInboxSelector} />
              <CallActionButton type="accept" disabled={!canCall} onPress={startCall} />
              <Pressable
                onPress={deleteDigit}
                disabled={!dialedNumber}
                style={tailwind.style('h-[64px] w-[64px] items-center justify-center')}>
                <Animated.Text
                  style={tailwind.style(
                    'text-base font-inter-medium-24',
                    dialedNumber ? 'text-gray-950' : 'text-gray-400',
                  )}>
                  Delete
                </Animated.Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <VoiceInboxSelectorSheet
        visible={voiceSelectorVisible}
        inboxes={voiceInboxes}
        selectedInboxId={selectedVoiceInboxId}
        onSelect={selectVoiceInbox}
        onClose={() => setVoiceSelectorVisible(false)}
      />
      <ContactableInboxSelectorSheet
        visible={messageSelectorVisible}
        inboxes={messageInboxes}
        isLoading={isLoadingMessageInboxes}
        onSelect={openMessageConversationForInbox}
        onClose={() => setMessageSelectorVisible(false)}
      />
      <DialContactSearchSheet
        visible={contactSearchVisible}
        onClose={() => setContactSearchVisible(false)}
        onSelect={selectSearchContact}
      />
    </SafeAreaView>
  );
};

export default DialScreen;
