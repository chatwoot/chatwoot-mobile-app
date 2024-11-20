import React from 'react';
import Animated from 'react-native-reanimated';

import { GenericListType } from '../../types';

import { GenericList } from './GenericList';

const otherConversationDetails: GenericListType[] = [
  {
    title: 'Initiated at',
    subtitleType: 'light',
    subtitle: 'Tue, Jun 06, 2023 4PM IST',
  },
  {
    title: 'Initiated from',
    subtitleType: 'light',
    subtitle: 'paperlayer.vercel.app',
    // Add case where you need to render an icon
    // channelType: "website",
  },
  {
    title: 'Browser',
    subtitleType: 'light',
    subtitle: 'Chrome 113.0.0.0',
  },
  {
    title: 'Operating system',
    subtitleType: 'light',
    subtitle: 'macOS 10.15.17',
  },
];

export const OtherConversationDetails = () => {
  return (
    <Animated.View>
      <GenericList sectionTitle="Other" list={otherConversationDetails} />
    </Animated.View>
  );
};
