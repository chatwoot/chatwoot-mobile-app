import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { BottomSheetModal, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import Animated from 'react-native-reanimated';

import { BottomSheetBackdrop, BottomSheetWrapper } from '@/components-next';
import { Avatar, BottomSheetHeader, Icon } from '@/components-next/common';
import { useAppDispatch, useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import { contactActions } from '@/store/contact/contactActions';
import { addContacts } from '@/store/contact/contactSlice';
import { selectAllContacts } from '@/store/contact/contactSelectors';
import { SearchIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import type { Contact } from '@/types/Contact';
import {
  getContactName,
  getContactPhoneSearchText,
  getContactPrimarySubtitle,
  getContactSearchText,
} from '@/utils/contactDisplayUtils';
import { digitsOnly } from '../utils/phoneNumberUtils';

const SEARCH_DEBOUNCE_MS = 250;

type DialContactSearchSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (contact: Contact) => void;
};

export const DialContactSearchSheet = ({
  visible,
  onClose,
  onSelect,
}: DialContactSearchSheetProps) => {
  const dispatch = useAppDispatch();
  const sheetRef = useRef<BottomSheetModal>(null);
  const cachedContacts = useAppSelector(selectAllContacts);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const localResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedPhoneQuery = digitsOnly(query);
    const sortedContacts = [...cachedContacts].sort((current, next) =>
      getContactName(current).localeCompare(getContactName(next), undefined, {
        sensitivity: 'base',
      }),
    );

    if (!normalizedQuery) {
      return sortedContacts.slice(0, 20);
    }

    return sortedContacts
      .filter(contact => {
        const matchesText = getContactSearchText(contact).includes(normalizedQuery);
        const matchesPhone =
          normalizedPhoneQuery.length > 0 &&
          getContactPhoneSearchText(contact).includes(normalizedPhoneQuery);

        return matchesText || matchesPhone;
      })
      .slice(0, 20);
  }, [cachedContacts, query]);

  const visibleResults = results.length ? results : localResults;

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss({ overshootClamping: true });
    }
  }, [visible]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    const normalizedPhoneQuery = digitsOnly(query);
    const apiQuery = normalizedPhoneQuery.length >= 3 ? normalizedPhoneQuery : normalizedQuery;

    if (normalizedQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      return undefined;
    }

    let cancelled = false;
    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await dispatch(
          contactActions.getContacts({ page: 1, query: apiQuery, sort: 'name' }),
        ).unwrap();
        const fetchedContacts = response.payload || [];
        dispatch(addContacts({ contacts: fetchedContacts }));

        if (!cancelled) {
          setResults(fetchedContacts);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [dispatch, query]);

  const handleSelect = (contact: Contact) => {
    onSelect(contact);
    onClose();
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      backdropComponent={BottomSheetBackdrop}
      handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
      enablePanDownToClose
      onDismiss={onClose}
      animationConfigs={animationConfigs}
      handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
      style={tailwind.style('rounded-[26px] overflow-hidden')}
      snapPoints={['74%']}>
      <BottomSheetWrapper>
        <BottomSheetHeader headerText={i18n.t('DIAL.SEARCH_CONTACT')} />
        <View style={tailwind.style('px-4 pt-2 pb-3')}>
          <View
            style={tailwind.style(
              'h-10 flex-row items-center rounded-[13px] border border-gray-100 bg-gray-50 px-3',
            )}>
            <Icon icon={<SearchIcon />} size={20} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={i18n.t('DIAL.SEARCH_CONTACT_PLACEHOLDER')}
              placeholderTextColor={tailwind.color('text-gray-700')}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              style={tailwind.style(
                'ml-2 flex-1 text-base font-inter-normal-20 leading-[22px] text-gray-950',
              )}
            />
          </View>
        </View>

        {isLoading ? (
          <View style={tailwind.style('items-center justify-center py-6')}>
            <ActivityIndicator />
          </View>
        ) : null}

        <Animated.ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator>
          {!isLoading &&
            visibleResults.map(contact => (
              <Pressable
                key={contact.id}
                accessibilityRole="button"
                onPress={() => handleSelect(contact)}
                style={({ pressed }) =>
                  tailwind.style(
                    'flex-row items-center px-4 py-3 border-b border-blackA-A3',
                    pressed ? 'bg-gray-50' : '',
                  )
                }>
                <Avatar
                  name={getContactName(contact)}
                  src={contact.thumbnail ? { uri: contact.thumbnail } : undefined}
                  size="md"
                />
                <View style={tailwind.style('ml-3 flex-1')}>
                  <Animated.Text
                    numberOfLines={1}
                    style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
                    {getContactName(contact)}
                  </Animated.Text>
                  <Animated.Text
                    numberOfLines={1}
                    style={tailwind.style('pt-1 text-sm font-inter-420-20 text-gray-700')}>
                    {getContactPrimarySubtitle(contact)}
                  </Animated.Text>
                </View>
              </Pressable>
            ))}

          {!isLoading && !visibleResults.length ? (
            <View style={tailwind.style('items-center justify-center pt-12 px-8')}>
              <Animated.Text
                style={tailwind.style('text-sm font-inter-420-20 text-gray-700 text-center')}>
                {i18n.t('CONTACTS.EMPTY')}
              </Animated.Text>
            </View>
          ) : null}
        </Animated.ScrollView>
      </BottomSheetWrapper>
    </BottomSheetModal>
  );
};
