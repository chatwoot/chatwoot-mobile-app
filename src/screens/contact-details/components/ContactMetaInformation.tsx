import React from 'react';
import Animated from 'react-native-reanimated';

import { CustomAttribute, AttributeListType } from '@/types';
import { AttributeList } from '@/components-next';
import i18n from '@/i18n';

export const ContactMetaInformation = ({ attributes }: { attributes: CustomAttribute[] }) => {
  const processedAttributes = attributes.map(attribute => ({
    title: attribute.attributeDisplayName,
    subtitle: attribute.value,
    subtitleType: 'dark',
    type: attribute.attributeDisplayType,
  }));
  return (
    <Animated.View>
      <AttributeList
        sectionTitle={i18n.t('CONTACT_DETAILS.CONTACT_ATTRIBUTES')}
        list={processedAttributes as AttributeListType[]}
      />
    </Animated.View>
  );
};
