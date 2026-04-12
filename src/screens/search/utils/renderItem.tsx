import React from 'react';
import type { NavigationProp } from '@react-navigation/native';
import { getSearchSectionById } from '@/screens/search/config';
import type { SearchItem, SearchSectionType } from '@/store/search/searchTypes';
import type { AppDispatch } from '@/store';
import type { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';

const SECTION_PROP_NAMES: Record<SearchSectionType, string> = {
  contacts: 'contact',
  conversations: 'conversation',
  messages: 'message',
};

export function createRenderItem(
  searchQuery: string,
  allSectionsData: Record<SearchSectionType, SearchItem[]>,
  navigation: NavigationProp<TabBarExcludedScreenParamList>,
  dispatch: AppDispatch,
) {
  const SearchResultItem = (
    item: SearchItem,
    sectionId: SearchSectionType,
    isLast: boolean = false,
  ) => {
    const section = getSearchSectionById(sectionId);
    if (!section) return null;

    const Component = section.renderComponent;
    const additionalData = section.getAdditionalData
      ? section.getAdditionalData(item, allSectionsData)
      : {};
    const propName = SECTION_PROP_NAMES[sectionId];
    const props: Record<string, unknown> = {
      [propName]: item,
      searchQuery,
      isLast,
    };

    if (additionalData && Object.keys(additionalData).length > 0) {
      Object.assign(props, additionalData);
    }

    const handlePress = async () => {
      try {
        await section.onPress(navigation, item, dispatch, additionalData);
      } catch {
        // Silently handle errors - navigation failures shouldn't crash the app
      }
    };

    return <Component {...props} onPress={handlePress} />;
  };
  return SearchResultItem;
}
