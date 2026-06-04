import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';

import { Avatar, Button, Icon } from '@/components-next';
import i18n from '@/i18n';
import { contactActions } from '@/store/contact/contactActions';
import { addContacts } from '@/store/contact/contactSlice';
import { ContactService } from '@/store/contact/contactService';
import { SearchIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import type { Contact } from '@/types';
import { getContactName, getContactSubtitle } from '@/utils/contactDisplayUtils';
import { showToast } from '@/utils/toastUtils';
import { useAppDispatch } from '@/hooks';

type ContactMergeTabProps = {
  contact?: Contact;
};

const MergeContactCard = ({ contact, helper }: { contact: Contact; helper: string }) => (
  <View style={tailwind.style('rounded-xl border border-gray-100 p-3 flex-row items-center')}>
    <Avatar
      name={getContactName(contact)}
      src={contact.thumbnail ? { uri: contact.thumbnail } : undefined}
      size="lg"
    />
    <View style={tailwind.style('ml-3 flex-1')}>
      <Animated.Text
        numberOfLines={1}
        style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
        {getContactName(contact)}
      </Animated.Text>
      {!!getContactSubtitle(contact) && (
        <Animated.Text
          numberOfLines={1}
          style={tailwind.style('pt-1 text-sm font-inter-420-20 text-gray-700')}>
          {getContactSubtitle(contact)}
        </Animated.Text>
      )}
    </View>
    <Animated.Text style={tailwind.style('text-xs font-inter-medium-24 text-gray-700')}>
      {helper}
    </Animated.Text>
  </View>
);

export const ContactMergeTab = ({ contact }: ContactMergeTabProps) => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [results, setResults] = useState<Contact[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  const trimmedQuery = query.trim();
  const canMerge = !!contact?.id && !!selectedContact?.id && !isMerging;

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      setResults([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await ContactService.getContacts({
          query: trimmedQuery,
          sort: 'name',
        });
        const contacts = response.payload.filter(item => item.id !== contact?.id);
        dispatch(addContacts({ contacts }));
        setResults(contacts);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [contact?.id, dispatch, trimmedQuery]);

  const visibleResults = useMemo(
    () => results.filter(result => result.id !== selectedContact?.id).slice(0, 6),
    [results, selectedContact?.id],
  );

  const resetSelection = () => {
    setSelectedContact(null);
    setQuery('');
    setResults([]);
  };

  const mergeContact = async () => {
    if (!contact?.id || !selectedContact?.id) {
      return;
    }

    setIsMerging(true);
    try {
      await dispatch(
        contactActions.mergeContacts({
          baseContactId: selectedContact.id,
          mergeeContactId: contact.id,
        }),
      ).unwrap();
      showToast({ message: i18n.t('CONTACT_DETAILS.MERGE_SUCCESS') });
      navigation.dispatch(StackActions.pop());
    } catch {
      showToast({ message: i18n.t('CONTACT_DETAILS.MERGE_FAILED') });
    } finally {
      setIsMerging(false);
    }
  };

  if (!contact?.id) {
    return (
      <Animated.Text
        style={tailwind.style(
          'text-base font-inter-normal-20 leading-[22px] text-gray-900 text-center py-10',
        )}>
        {i18n.t('CONTACT_DETAILS.MERGE_UNAVAILABLE')}
      </Animated.Text>
    );
  }

  return (
    <View style={tailwind.style('px-4 py-5')}>
      <Animated.Text style={tailwind.style('text-base font-inter-580-24 text-gray-950')}>
        {i18n.t('CONTACT_DETAILS.MERGE_TITLE')}
      </Animated.Text>
      <Animated.Text style={tailwind.style('pt-2 text-sm font-inter-420-20 text-gray-700')}>
        {i18n.t('CONTACT_DETAILS.MERGE_DESCRIPTION')}
      </Animated.Text>

      <View style={tailwind.style('pt-6')}>
        <Animated.View style={tailwind.style('flex-row items-center justify-between pb-2')}>
          <Animated.Text style={tailwind.style('text-sm font-inter-medium-24 text-gray-950')}>
            {i18n.t('CONTACT_DETAILS.MERGE_PRIMARY')}
          </Animated.Text>
          <Animated.Text
            style={tailwind.style(
              'rounded-md bg-gray-50 px-3 py-1 text-xs font-inter-medium-24 text-teal-800',
            )}>
            {i18n.t('CONTACT_DETAILS.MERGE_TO_BE_SAVED')}
          </Animated.Text>
        </Animated.View>
        {selectedContact ? (
          <Pressable onPress={resetSelection}>
            <MergeContactCard
              contact={selectedContact}
              helper={i18n.t('CONTACT_DETAILS.MERGE_CHANGE')}
            />
          </Pressable>
        ) : (
          <>
            <View
              style={tailwind.style(
                'h-[48px] flex-row items-center rounded-[13px] bg-gray-50 px-4 border border-blackA-A3',
              )}>
              <Icon
                icon={<SearchIcon stroke={tailwind.color('text-gray-700')} />}
                size={20}
                style={tailwind.style('mr-3')}
              />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setQuery}
                placeholder={i18n.t('CONTACT_DETAILS.MERGE_SEARCH_PLACEHOLDER')}
                placeholderTextColor={tailwind.color('text-gray-700')}
                returnKeyType="search"
                style={tailwind.style(
                  'flex-1 text-base font-inter-420-20 leading-[21px] text-gray-950',
                )}
                value={query}
              />
              {isSearching ? <ActivityIndicator /> : null}
            </View>
            {visibleResults.map(result => (
              <Pressable
                key={result.id}
                onPress={() => setSelectedContact(result)}
                style={({ pressed }) =>
                  tailwind.style(
                    'flex-row items-center px-1 py-3 border-b border-blackA-A3',
                    pressed ? 'bg-gray-50' : '',
                  )
                }>
                <Avatar
                  name={getContactName(result)}
                  src={result.thumbnail ? { uri: result.thumbnail } : undefined}
                  size="md"
                />
                <View style={tailwind.style('ml-3 flex-1')}>
                  <Animated.Text
                    numberOfLines={1}
                    style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
                    {getContactName(result)}
                  </Animated.Text>
                  {!!getContactSubtitle(result) && (
                    <Animated.Text
                      numberOfLines={1}
                      style={tailwind.style('pt-1 text-sm font-inter-420-20 text-gray-700')}>
                      {getContactSubtitle(result)}
                    </Animated.Text>
                  )}
                </View>
              </Pressable>
            ))}
          </>
        )}
      </View>

      <View style={tailwind.style('items-center py-5')}>
        <Animated.Text style={tailwind.style('text-2xl text-gray-400')}>^ ^ ^</Animated.Text>
      </View>

      <View>
        <Animated.View style={tailwind.style('flex-row items-center justify-between pb-2')}>
          <Animated.Text style={tailwind.style('text-sm font-inter-medium-24 text-gray-950')}>
            {i18n.t('CONTACT_DETAILS.MERGE_SECONDARY')}
          </Animated.Text>
          <Animated.Text
            style={tailwind.style(
              'rounded-md bg-gray-50 px-3 py-1 text-xs font-inter-medium-24 text-ruby-800',
            )}>
            {i18n.t('CONTACT_DETAILS.MERGE_TO_BE_DELETED')}
          </Animated.Text>
        </Animated.View>
        <MergeContactCard contact={contact} helper="" />
      </View>

      <View style={tailwind.style('flex-row gap-3 pt-6')}>
        <View style={tailwind.style('flex-1')}>
          <Button
            text={i18n.t('CONTACT_DETAILS.MERGE_CANCEL')}
            variant="secondary"
            handlePress={resetSelection}
          />
        </View>
        <View style={tailwind.style('flex-1 opacity-100', !canMerge ? 'opacity-50' : '')}>
          <Button
            text={i18n.t('CONTACT_DETAILS.MERGE_CONFIRM')}
            disabled={!canMerge}
            handlePress={mergeContact}
          />
        </View>
      </View>
    </View>
  );
};
