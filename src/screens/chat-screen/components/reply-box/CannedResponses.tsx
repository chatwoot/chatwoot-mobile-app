import React, { useEffect } from 'react';
import { Pressable, ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { selectAllCannedResponses } from '@/store/canned-response/cannedResponseSlice';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { cannedResponseActions } from '@/store/canned-response/cannedResponseActions';
import { CannedResponse } from '@/types';

type CannedResponsesProps = {
  searchKey: string;
  onSelect: (cannedResponse: CannedResponse) => void;
};

export const CannedResponses = (props: CannedResponsesProps) => {
  const dispatch = useAppDispatch();
  const cannedResponses = useAppSelector(selectAllCannedResponses);

  useEffect(() => {
    dispatch(cannedResponseActions.index({ searchKey: props.searchKey }));
  }, [props.searchKey]);

  if (!props.searchKey || cannedResponses.length === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        tailwind.style(
          'absolute bottom-full left-0 right-0 bg-white border-t border-gray-200  max-h-[186px]',
        ),
      ]}>
      <ScrollView>
        {cannedResponses.map(cannedResponse => (
          <Pressable
            onPress={() => props.onSelect(cannedResponse)}
            style={tailwind.style(
              'w-full flex-row justify-between items-center border-b border-gray-200 py-2 px-4',
            )}
            key={cannedResponse.id}>
            <Animated.Text numberOfLines={1} style={tailwind.style('text-md flex-1 text-gray-950')}>
              {cannedResponse.content.replace(/\n/g, ' ')}
            </Animated.Text>
            <Animated.Text style={tailwind.style('text-sm text-gray-900 ml-2')}>
              {`/${cannedResponse.shortCode}`}
            </Animated.Text>
          </Pressable>
        ))}
      </ScrollView>
    </Animated.View>
  );
};
