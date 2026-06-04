import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { BottomSheetModal, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import Animated from 'react-native-reanimated';

import { Avatar, BottomSheetHeader, Icon } from '@/components-next/common';
import { BottomSheetBackdrop, BottomSheetWrapper } from '@/components-next';
import i18n from '@/i18n';
import { CompanyService } from '@/store/company/companyService';
import { SearchIcon, TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import type { Company } from '@/types/Company';
import { getCompanyAvatarUrl } from '@/utils/companyUtils';

const SEARCH_DEBOUNCE_MS = 250;

type ContactCompanySelectorSheetProps = {
  visible: boolean;
  selectedCompanyId?: number;
  onSelect: (company: Company) => void;
  onClose: () => void;
};

export const ContactCompanySelectorSheet = ({
  visible,
  selectedCompanyId,
  onSelect,
  onClose,
}: ContactCompanySelectorSheetProps) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [query, setQuery] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss({ overshootClamping: true });
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    let cancelled = false;
    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await CompanyService.getCompanies({
          page: 1,
          query: query.trim(),
          sort: 'name',
        });

        if (!cancelled) {
          setCompanies(response.payload || []);
        }
      } catch {
        if (!cancelled) {
          setCompanies([]);
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
  }, [query, visible]);

  const handleSelect = (company: Company) => {
    onSelect(company);
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
        <BottomSheetHeader headerText={i18n.t('CONTACT_DETAILS.CHOOSE_COMPANY')} />
        <View style={tailwind.style('px-4 pt-2 pb-3')}>
          <View
            style={tailwind.style(
              'h-10 flex-row items-center rounded-[13px] border border-gray-100 bg-gray-50 px-3',
            )}>
            <Icon icon={<SearchIcon />} size={20} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={i18n.t('COMPANIES.SEARCH_PLACEHOLDER')}
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
            companies.map(company => {
              const avatarUrl = getCompanyAvatarUrl(company);
              const isSelected = company.id === selectedCompanyId;

              return (
                <Pressable
                  key={company.id}
                  accessibilityRole="button"
                  onPress={() => handleSelect(company)}
                  style={({ pressed }) =>
                    tailwind.style(
                      'flex-row items-center border-b border-blackA-A3 px-4 py-3',
                      pressed ? 'bg-gray-50' : '',
                    )
                  }>
                  <Avatar
                    name={company.name}
                    src={avatarUrl ? { uri: avatarUrl } : undefined}
                    size="md"
                  />
                  <View style={tailwind.style('ml-3 flex-1')}>
                    <Animated.Text
                      numberOfLines={1}
                      style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
                      {company.name}
                    </Animated.Text>
                    {!!company.domain && (
                      <Animated.Text
                        numberOfLines={1}
                        style={tailwind.style('pt-1 text-sm font-inter-420-20 text-gray-700')}>
                        {company.domain}
                      </Animated.Text>
                    )}
                  </View>
                  {isSelected ? <Icon icon={<TickIcon />} size={20} /> : null}
                </Pressable>
              );
            })}

          {!isLoading && !companies.length ? (
            <View style={tailwind.style('items-center justify-center px-8 pt-12')}>
              <Animated.Text
                style={tailwind.style('text-center text-sm font-inter-420-20 text-gray-700')}>
                {i18n.t('COMPANIES.EMPTY')}
              </Animated.Text>
            </View>
          ) : null}
        </Animated.ScrollView>
      </BottomSheetWrapper>
    </BottomSheetModal>
  );
};
