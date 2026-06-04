import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  TextInput,
  View,
} from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Icon } from '@/components-next/common';
import i18n from '@/i18n';
import { CompanyService } from '@/store/company/companyService';
import { ChevronLeft, SearchIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import type { Company } from '@/types/Company';
import { getCompanyAvatarUrl } from '@/utils/companyUtils';
import { formatCount } from '@/utils/countUtils';

const sortCompaniesByName = (companies: Company[]) =>
  [...companies].sort((current, next) =>
    current.name.localeCompare(next.name, undefined, { sensitivity: 'base' }),
  );

const mergeCompanies = (current: Company[], incoming: Company[]) => {
  const companiesById = new Map(current.map(company => [company.id, company]));
  incoming.forEach(company => companiesById.set(company.id, company));
  return sortCompaniesByName([...companiesById.values()]);
};

const hydrateSearchContactCounts = async (companies: Company[], shouldHydrate: boolean) => {
  if (!shouldHydrate || companies.length === 0) {
    return companies;
  }

  return Promise.all(
    companies.map(async company => {
      try {
        const contactsCount = await CompanyService.getCompanyContactsCount(company.id);
        return { ...company, contactsCount };
      } catch {
        return company;
      }
    }),
  );
};

const CompanyRow = ({
  company,
  onPress,
}: {
  company: Company;
  onPress: (company: Company) => void;
}) => {
  const avatarUrl = getCompanyAvatarUrl(company);
  const contactCountLabel =
    typeof company.contactsCount === 'number'
      ? i18n.t(
          company.contactsCount === 1 ? 'COMPANIES.CONTACT_COUNT_ONE' : 'COMPANIES.CONTACT_COUNT',
          { count: company.contactsCount },
        )
      : '';
  const subtitle = [company.domain, contactCountLabel].filter(Boolean).join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(company)}
      style={({ pressed }) =>
        tailwind.style(
          'flex-row items-center border-b border-blackA-A3 px-4 py-3',
          pressed ? 'bg-gray-50' : '',
        )
      }>
      <Avatar name={company.name} src={avatarUrl ? { uri: avatarUrl } : undefined} size="md" />
      <View style={tailwind.style('ml-3 flex-1')}>
        <Animated.Text
          numberOfLines={1}
          style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
          {company.name}
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

const CompaniesScreen = () => {
  const navigation = useNavigation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMoreCompanies, setHasMoreCompanies] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalCompaniesCount, setTotalCompaniesCount] = useState(0);
  const companiesRef = useRef<Company[]>([]);
  const latestRequestIdRef = useRef(0);
  const companiesCount = totalCompaniesCount || companies.length;
  const searchPlaceholder = companiesCount
    ? i18n.t('COMPANIES.SEARCH_PLACEHOLDER_WITH_COUNT', {
        count: formatCount(companiesCount),
      })
    : i18n.t('COMPANIES.SEARCH_PLACEHOLDER');

  const fetchCompanies = useCallback(
    async ({ nextPage = 1, append = false, refresh = false, searchQuery = query } = {}) => {
      const requestId = latestRequestIdRef.current + 1;
      latestRequestIdRef.current = requestId;

      if (refresh) {
        setIsRefreshing(true);
      } else if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const response = await CompanyService.getCompanies({
          page: nextPage,
          query: searchQuery,
        });
        const fetchedCompanies = await hydrateSearchContactCounts(
          response.payload || [],
          !!searchQuery.trim(),
        );
        if (requestId !== latestRequestIdRef.current) {
          return;
        }

        const nextCompanies = append
          ? mergeCompanies(companiesRef.current, fetchedCompanies)
          : sortCompaniesByName(fetchedCompanies);
        const totalCount = response.meta?.totalCount ?? response.meta?.count ?? 0;
        if (typeof totalCount === 'number') {
          setTotalCompaniesCount(totalCount);
        }
        const hasMoreByTotalPages = response.meta?.totalPages
          ? nextPage < response.meta.totalPages
          : undefined;
        const hasMoreByCount = totalCount
          ? nextCompanies.length < totalCount
          : fetchedCompanies.length > 0;

        companiesRef.current = nextCompanies;
        setCompanies(nextCompanies);
        setPage(nextPage);
        setHasMoreCompanies(response.meta?.hasMore ?? hasMoreByTotalPages ?? hasMoreByCount);
      } finally {
        if (requestId === latestRequestIdRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
          setIsRefreshing(false);
        }
      }
    },
    [query],
  );

  useEffect(() => {
    const timer = setTimeout(
      () => {
        fetchCompanies({ nextPage: 1, searchQuery: query.trim() });
      },
      query.trim() ? 300 : 0,
    );
    return () => clearTimeout(timer);
  }, [fetchCompanies, query]);

  const openCompany = (company: Company) => {
    navigation.dispatch(
      StackActions.push('CompanyDetails', {
        companyId: company.id,
        contactsCount: company.contactsCount,
        companyName: company.name,
        companyDomain: company.domain,
        companyDescription: company.description,
        companyAvatarUrl: getCompanyAvatarUrl(company),
      }),
    );
  };

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.dispatch(StackActions.replace('MoreScreen'));
  };

  const refreshCompanies = () => fetchCompanies({ nextPage: 1, refresh: true });

  const loadMoreCompanies = () => {
    if (!isLoading && !isLoadingMore && hasMoreCompanies) {
      fetchCompanies({ nextPage: page + 1, append: true });
    }
  };

  return (
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-white')}
        barStyle={'dark-content'}
      />
      <View style={tailwind.style('px-4 pb-3 pt-2')}>
        <View style={tailwind.style('flex-row items-center pb-[12px]')}>
          <Pressable
            accessibilityRole="button"
            hitSlop={16}
            onPress={goBack}
            style={tailwind.style('h-11 w-11 items-center justify-center')}>
            <Icon icon={<ChevronLeft stroke={tailwind.color('text-gray-700')} />} size={26} />
          </Pressable>
          <View style={tailwind.style('flex-1 min-w-0 px-3')}>
            <Animated.Text
              numberOfLines={1}
              style={tailwind.style(
                'text-[17px] font-inter-medium-24 tracking-[0.32px] leading-[21px] text-center text-gray-950',
              )}>
              {i18n.t('COMPANIES.TITLE')}
            </Animated.Text>
          </View>
          <View style={tailwind.style('w-11')} />
        </View>
        <View
          style={tailwind.style(
            'h-10 flex-row items-center rounded-[13px] border border-gray-100 bg-gray-50 px-3',
          )}>
          <Icon icon={<SearchIcon />} size={20} style={tailwind.style('mr-2')} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={searchPlaceholder}
            placeholderTextColor={tailwind.color('text-gray-700')}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            style={tailwind.style(
              'flex-1 text-base font-inter-normal-20 leading-[22px] text-gray-950',
            )}
          />
        </View>
      </View>

      <FlatList
        data={companies}
        keyExtractor={company => company.id.toString()}
        keyboardShouldPersistTaps="handled"
        onEndReached={loadMoreCompanies}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshCompanies}
            tintColor="#11181C"
          />
        }
        renderItem={({ item }) => <CompanyRow company={item} onPress={openCompany} />}
        contentContainerStyle={tailwind.style('pb-28')}
        ListEmptyComponent={
          <View style={tailwind.style('items-center justify-center px-8 pt-20')}>
            {isLoading ? (
              <ActivityIndicator color={tailwind.color('text-gray-950')} />
            ) : (
              <Animated.Text
                style={tailwind.style('text-center text-sm font-inter-420-20 text-gray-700')}>
                {i18n.t('COMPANIES.EMPTY')}
              </Animated.Text>
            )}
          </View>
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={tailwind.style('py-4')}>
              <ActivityIndicator color={tailwind.color('text-gray-950')} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default CompaniesScreen;
