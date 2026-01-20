import React from 'react';
import type { NavigationProp } from '@react-navigation/native';
import { getSearchSectionById } from '@/screens/search/config';
import type { SearchSectionType } from '@/screens/search/config';
import type { AppDispatch } from '@/store';

export function createRenderItem(
  searchQuery: string,
  allSectionsData: Record<SearchSectionType, any[]>,
  navigation: NavigationProp<any>,
  dispatch: AppDispatch,
) {
  return (item: any, sectionId: SearchSectionType, isLast: boolean = false) => {
    const section = getSearchSectionById(sectionId);
    if (!section) return null;

    const Component = section.renderComponent;
    const additionalData = section.getAdditionalData
      ? section.getAdditionalData(item, allSectionsData)
      : {};
    const propName = sectionId.slice(0, -1);
    const props: any = {
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
      } catch (error) {
        // Silently handle errors - navigation failures shouldn't crash the app
      }
    };

    return (
      <Component
        {...props}
        onPress={handlePress}
      />
    );
  };
}
