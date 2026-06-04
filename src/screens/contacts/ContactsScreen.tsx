import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  View,
} from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Icon } from '@/components-next/common';
import { TAB_BAR_HEIGHT } from '@/constants';
import { useAppDispatch } from '@/hooks';
import i18n from '@/i18n';
import { contactActions } from '@/store/contact/contactActions';
import { addContacts, addContact } from '@/store/contact/contactSlice';
import type { CreateContactPayload } from '@/store/contact/contactTypes';
import { AddIcon, InboxFilterIcon, SearchIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import type { Contact } from '@/types/Contact';
import { formatCount } from '@/utils/countUtils';
import { getCompanyName, getContactName } from '@/utils/contactDisplayUtils';
import { showToast } from '@/utils/toastUtils';
import { ContactSortSheet, type ContactSortMode } from './components/ContactSortSheet';
import { CreateContactSheet } from './components/CreateContactSheet';

const CONTACT_PREVIEW_LIMIT = 15;

const getCreatedAtValue = (contact: Contact) =>
  typeof contact.createdAt === 'number' ? contact.createdAt : Number(contact.createdAt || 0);

const sortContactsByNewest = (contacts: Contact[]) =>
  [...contacts].sort((current, next) => getCreatedAtValue(next) - getCreatedAtValue(current));

const sortContactsByOldest = (contacts: Contact[]) =>
  [...contacts].sort((current, next) => getCreatedAtValue(current) - getCreatedAtValue(next));

const sortContacts = (contacts: Contact[], sortMode: ContactSortMode) => {
  return sortMode === 'oldest' ? sortContactsByOldest(contacts) : sortContactsByNewest(contacts);
};

const getContactSortParam = (sortMode: ContactSortMode) =>
  sortMode === 'oldest' ? 'created_at' : '-created_at';

const ContactRow = ({
  contact,
  onPress,
}: {
  contact: Contact;
  onPress: (contact: Contact) => void;
}) => {
  const name = getContactName(contact);
  const companyName = getCompanyName(contact);
  const subtitle = companyName || contact.email || contact.phoneNumber || '';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(contact)}
      style={({ pressed }) =>
        tailwind.style(
          'flex-row items-center px-4 py-3 border-b border-blackA-A3',
          pressed ? 'bg-gray-50' : '',
        )
      }>
      <Avatar
        name={name}
        src={contact.thumbnail ? { uri: contact.thumbnail } : undefined}
        size="md"
      />
      <View style={tailwind.style('ml-3 flex-1')}>
        <Animated.Text
          numberOfLines={1}
          style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
          {name}
        </Animated.Text>
        {!!subtitle && (
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style('pt-1 text-sm font-inter-420-20 text-gray-700')}>
            {subtitle}
          </Animated.Text>
        )}
      </View>
    </Pressable>
  );
};

const ContactsScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const isLoadingRef = useRef(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortMode, setSortMode] = useState<ContactSortMode>('newest');
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const [createContactVisible, setCreateContactVisible] = useState(false);
  const [isCreatingContact, setIsCreatingContact] = useState(false);
  const [totalContactsCount, setTotalContactsCount] = useState(0);
  const contactsCount = totalContactsCount || contacts.length;
  const searchPlaceholder = contactsCount
    ? i18n.t('CONTACTS.SEARCH_PLACEHOLDER_WITH_COUNT', {
        count: formatCount(contactsCount),
      })
    : i18n.t('CONTACTS.SEARCH_PLACEHOLDER');

  const fetchContacts = useCallback(
    async ({ refresh = false } = {}) => {
      if (isLoadingRef.current && !refresh) {
        return;
      }

      isLoadingRef.current = true;
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const response = await dispatch(
          contactActions.getContacts({
            page: 1,
            sort: getContactSortParam(sortMode),
          }),
        ).unwrap();
        const fetchedContacts = response.payload || [];
        const totalCount = response.meta?.totalCount ?? response.meta?.count;
        if (typeof totalCount === 'number') {
          setTotalContactsCount(totalCount);
        }
        dispatch(addContacts({ contacts: fetchedContacts }));
        setContacts(sortContacts(fetchedContacts, sortMode).slice(0, CONTACT_PREVIEW_LIMIT));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        isLoadingRef.current = false;
      }
    },
    [dispatch, sortMode],
  );

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const openContact = (contact: Contact) => {
    dispatch(addContact(contact));
    navigation.dispatch(StackActions.push('ContactDetails', { contactId: contact.id }));
  };

  const openContactSearch = () => {
    navigation.dispatch(StackActions.push('SearchScreen', { initialTab: 'contacts' }));
  };

  const changeSortMode = (nextSortMode: ContactSortMode) => {
    setSortMode(nextSortMode);
    setContacts(currentContacts => sortContacts(currentContacts, nextSortMode));
  };

  const createContact = async (payload: CreateContactPayload) => {
    setIsCreatingContact(true);

    try {
      const createdContact = await dispatch(contactActions.createContact(payload)).unwrap();
      dispatch(addContact(createdContact));
      setContacts(currentContacts =>
        sortContacts([createdContact, ...currentContacts], sortMode).slice(
          0,
          CONTACT_PREVIEW_LIMIT,
        ),
      );
      setTotalContactsCount(currentCount => currentCount + 1);
      setCreateContactVisible(false);
      showToast({ message: i18n.t('CONTACTS.CREATE_SUCCESS') });
    } catch {
      showToast({ message: i18n.t('CONTACTS.CREATE_FAILED') });
    } finally {
      setIsCreatingContact(false);
    }
  };

  const refreshContacts = () => fetchContacts({ refresh: true });

  return (
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-white')}
        barStyle={'dark-content'}
      />
      <View style={tailwind.style('px-4 pt-2 pb-3')}>
        <View style={tailwind.style('flex-row items-center justify-between pb-[12px]')}>
          <View style={tailwind.style('w-12')} />
          <View style={tailwind.style('flex-1 min-w-0 px-3')}>
            <Animated.Text
              numberOfLines={1}
              style={tailwind.style(
                'text-[17px] font-inter-medium-24 tracking-[0.32px] leading-[21px] text-center text-gray-950',
              )}>
              {i18n.t('SEARCH.SECTIONS.CONTACTS')}
            </Animated.Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={i18n.t('CONTACTS.SORT.TITLE')}
            onPress={() => setSortSheetVisible(true)}
            style={({ pressed }) => tailwind.style('w-12 items-end', pressed ? 'opacity-60' : '')}>
            <Animated.View>
              {sortMode !== 'newest' && (
                <Animated.View
                  style={tailwind.style(
                    'absolute z-10 -right-0.5 h-2.5 w-2.5 rounded-full bg-blue-800',
                  )}
                />
              )}
              <Icon icon={<InboxFilterIcon />} size={24} />
            </Animated.View>
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={openContactSearch}
          style={tailwind.style(
            'h-10 flex-row items-center rounded-[13px] border border-gray-100 bg-gray-50 px-3',
          )}>
          <Icon icon={<SearchIcon />} size={20} style={tailwind.style('mr-2')} />
          <Animated.Text
            style={tailwind.style(
              'flex-1 text-base font-inter-normal-20 leading-[22px] text-gray-700',
            )}>
            {searchPlaceholder}
          </Animated.Text>
        </Pressable>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={contact => contact.id.toString()}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshContacts}
            tintColor="#11181C"
          />
        }
        renderItem={({ item }) => <ContactRow contact={item} onPress={openContact} />}
        contentContainerStyle={tailwind.style('pb-28')}
        ListEmptyComponent={
          <View style={tailwind.style('items-center justify-center pt-20 px-8')}>
            {isLoading ? (
              <ActivityIndicator color={tailwind.color('text-gray-950')} />
            ) : (
              <Animated.Text
                style={tailwind.style('text-sm font-inter-420-20 text-gray-700 text-center')}>
                {i18n.t('CONTACTS.EMPTY')}
              </Animated.Text>
            )}
          </View>
        }
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={i18n.t('CONTACTS.CREATE_TITLE')}
        onPress={() => setCreateContactVisible(true)}
        style={({ pressed }) =>
          tailwind.style(
            `absolute right-6 bottom-[${TAB_BAR_HEIGHT + 20}px] h-14 w-14 rounded-full bg-blue-800 items-center justify-center shadow-lg`,
            pressed ? 'bg-blue-900' : '',
          )
        }>
        <Icon icon={<AddIcon stroke="#FFFFFF" />} size={30} />
      </Pressable>
      <ContactSortSheet
        visible={sortSheetVisible}
        selectedSort={sortMode}
        onSelect={changeSortMode}
        onClose={() => setSortSheetVisible(false)}
      />
      <CreateContactSheet
        visible={createContactVisible}
        isSaving={isCreatingContact}
        showCompanyField
        onCreate={createContact}
        onClose={() => setCreateContactVisible(false)}
      />
    </SafeAreaView>
  );
};

export default ContactsScreen;
