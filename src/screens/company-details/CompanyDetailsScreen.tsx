import React, { useCallback, useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import Animated from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Tabs } from '@/components-next';
import { TAB_BAR_HEIGHT } from '@/constants';
import { useAppDispatch } from '@/hooks';
import { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import { ContactDetailsScreenHeader } from '@/screens/contact-details/components';
import { companyActions } from '@/store/company/companyActions';
import { tailwind } from '@/theme';
import type { Company, CompanyContact, CompanyNote, UpdateCompanyPayload } from '@/types/Company';
import { getCompanyAvatarUrl } from '@/utils/companyUtils';

import { CompanyContactsTab } from './components/CompanyContactsTab';
import { CompanyDetailsTab } from './components/CompanyDetailsTab';
import { CompanyNotesTab } from './components/CompanyNotesTab';

type CompanyDetailsScreenProps = NativeStackScreenProps<
  TabBarExcludedScreenParamList,
  'CompanyDetails'
>;

const COMPANY_TABS = ['Attributes', 'Notes', 'Contacts'] as const;

type CompanyTab = (typeof COMPANY_TABS)[number];

const CompanyDetailsScreen = ({ route, navigation }: CompanyDetailsScreenProps) => {
  const {
    companyId,
    contactsCount: routeContactsCount,
    companyName,
    companyDomain,
    companyDescription,
    companyAvatarUrl,
  } = route.params;
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<CompanyTab>('Attributes');
  const [company, setCompany] = useState<Company | null>(
    companyName
      ? {
          id: companyId,
          name: companyName,
          domain: companyDomain,
          description: companyDescription,
          avatarUrl: companyAvatarUrl,
          contactsCount: routeContactsCount,
        }
      : null,
  );
  const [notes, setNotes] = useState<CompanyNote[]>([]);
  const [contacts, setContacts] = useState<CompanyContact[]>([]);
  const [contactsCount, setContactsCount] = useState(routeContactsCount);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  const loadCompany = useCallback(async () => {
    const response = await dispatch(companyActions.getCompany({ companyId })).unwrap();
    const nextCompany = {
      ...response,
      contactsCount: response.contactsCount ?? routeContactsCount,
    };
    setCompany(nextCompany);
    setContactsCount(nextCompany.contactsCount);
  }, [companyId, dispatch, routeContactsCount]);

  const loadNotes = useCallback(async () => {
    setIsLoadingNotes(true);
    try {
      const response = await dispatch(companyActions.getCompanyNotes({ companyId })).unwrap();
      setNotes(response);
    } finally {
      setIsLoadingNotes(false);
    }
  }, [companyId, dispatch]);

  const loadContacts = useCallback(async () => {
    setIsLoadingContacts(true);
    try {
      const response = await dispatch(companyActions.getCompanyContacts({ companyId })).unwrap();
      const nextContactsCount = response.meta?.totalCount ?? response.payload.length;
      setContacts(response.payload);
      setContactsCount(nextContactsCount);
      setCompany(currentCompany =>
        currentCompany ? { ...currentCompany, contactsCount: nextContactsCount } : currentCompany,
      );
    } finally {
      setIsLoadingContacts(false);
    }
  }, [companyId, dispatch]);

  const saveCompany = useCallback(
    async (companyPayload: UpdateCompanyPayload) => {
      setIsSavingCompany(true);
      try {
        const response = await dispatch(
          companyActions.updateCompany({ companyId, company: companyPayload }),
        ).unwrap();
        const nextCompany = {
          ...response,
          contactsCount: response.contactsCount ?? contactsCount,
        };
        setCompany(nextCompany);
        setContactsCount(nextCompany.contactsCount);
      } finally {
        setIsSavingCompany(false);
      }
    },
    [companyId, contactsCount, dispatch],
  );

  const createNote = useCallback(
    async (content: string) => {
      const note = await dispatch(
        companyActions.createCompanyNote({ companyId, content }),
      ).unwrap();
      setNotes(currentNotes => [note, ...currentNotes]);
    },
    [companyId, dispatch],
  );

  const updateNote = useCallback(
    async (noteId: number, content: string) => {
      const note = await dispatch(
        companyActions.updateCompanyNote({ companyId, noteId, content }),
      ).unwrap();
      setNotes(currentNotes =>
        currentNotes.map(currentNote => (currentNote.id === note.id ? note : currentNote)),
      );
    },
    [companyId, dispatch],
  );

  const deleteNote = useCallback(
    async (noteId: number) => {
      await dispatch(companyActions.deleteCompanyNote({ companyId, noteId })).unwrap();
      setNotes(currentNotes => currentNotes.filter(note => note.id !== noteId));
    },
    [companyId, dispatch],
  );

  useEffect(() => {
    loadCompany().catch(() => undefined);
    loadNotes().catch(() => undefined);
    loadContacts().catch(() => undefined);
  }, [loadCompany, loadContacts, loadNotes]);

  const tabItems = COMPANY_TABS.map(tab => ({
    id: tab,
    label: tab,
    count: tab === 'Contacts' && contactsCount ? contactsCount : undefined,
  }));

  return (
    <View
      style={tailwind.style(
        `flex-1 bg-white pt-6 ${Platform.OS === 'android' ? 'pt-12' : 'pt-6'}`,
      )}>
      <ContactDetailsScreenHeader
        name={company?.name || 'Company'}
        thumbnail={getCompanyAvatarUrl(company)}
        bio={company?.domain || company?.description || ''}
      />
      <Animated.View style={tailwind.style('px-4 pt-4')}>
        <Tabs
          items={tabItems}
          activeTabId={activeTab}
          onTabPress={tabId => setActiveTab(tabId as CompanyTab)}
        />
      </Animated.View>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT}]`)}>
        {activeTab === 'Attributes' ? (
          <CompanyDetailsTab company={company} isSaving={isSavingCompany} onSave={saveCompany} />
        ) : null}
        {activeTab === 'Notes' ? (
          <CompanyNotesTab
            notes={notes}
            isLoading={isLoadingNotes}
            onCreateNote={createNote}
            onUpdateNote={updateNote}
            onDeleteNote={deleteNote}
          />
        ) : null}
        {activeTab === 'Contacts' ? (
          <CompanyContactsTab
            contacts={contacts}
            isLoading={isLoadingContacts}
            onContactPress={contact =>
              navigation.navigate('ContactDetails', {
                contactId: contact.id,
                contact,
                company: company ? { id: company.id, name: company.name } : undefined,
              })
            }
          />
        ) : null}
      </Animated.ScrollView>
    </View>
  );
};

export default CompanyDetailsScreen;
