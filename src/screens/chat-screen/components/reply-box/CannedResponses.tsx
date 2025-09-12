import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { selectAllCannedResponses } from '@/store/canned-response/cannedResponseSlice';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { cannedResponseActions } from '@/store/canned-response/cannedResponseActions';
import { CannedResponse } from '@/types';
import { FlashList } from '@shopify/flash-list';

type CannedResponsesProps = {
  searchKey: string;
  onSelect: (cannedResponse: CannedResponse) => void;
};

const CannedResponseItem = ({
  item,
  onSelect,
}: {
  item: CannedResponse;
  onSelect: (cannedResponse: CannedResponse) => void;
}) => {
  return (
    <Pressable
      onPress={() => onSelect(item)}
      style={tailwind.style(
        'w-full flex-row justify-between items-center border-b border-gray-200 py-3 px-4',
      )}>
      <Animated.Text numberOfLines={1} style={tailwind.style('text-md flex-1 text-gray-950')}>
        {item.content.replace(/\n/g, ' ')}
      </Animated.Text>
      <Animated.Text style={tailwind.style('text-sm text-gray-900 ml-2')}>
        {`/${item.shortCode}`}
      </Animated.Text>
    </Pressable>
  );
};

export const CannedResponses = (props: CannedResponsesProps) => {
  const dispatch = useAppDispatch();
  const cannedResponses = useAppSelector(selectAllCannedResponses);

  useEffect(() => {
    const searchKey = props.searchKey.slice(1);
    dispatch(cannedResponseActions.index({ searchKey }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.searchKey]);

  if (!props.searchKey || cannedResponses.length === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        tailwind.style(
          'left-0 right-0 bg-white border-t border-gray-200 max-h-[180px] relative bottom-0 h-[180px]',
        ),
      ]}>
      <FlashList
        data={cannedResponses}
        renderItem={({ item }) => <CannedResponseItem item={item} onSelect={props.onSelect} />}
        keyExtractor={item => item.id.toString()}
        keyboardShouldPersistTaps="always"
      />
    </Animated.View>
  );
};
