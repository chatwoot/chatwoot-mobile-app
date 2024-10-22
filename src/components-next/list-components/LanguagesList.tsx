import React, { useState } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { LANGUAGES } from '@/constants';
import { TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic } from '@/utils';
import { Icon } from '@/components-next/common';

export type LanguageItemType = {
  title: string;
  key: string;
};

type LanguageCellProps = {
  item: LanguageItemType;
  index: number;
};

const languagesList = Object.keys(LANGUAGES).map((languageCode: string) => {
  return {
    // @ts-expect-error
    title: LANGUAGES[languageCode],
    key: languageCode,
  };
});

const LanguageCell = (props: LanguageCellProps) => {
  const { item, index } = props;
  const [currentLanguage, setLanguage] = useState('en');
  const hapticSelection = useHaptic();

  const handlePress = () => {
    hapticSelection?.();
    setLanguage(item.key);
    // i18n.changeLanguage(item.key);
    // setLanguage(item.key as keyof typeof LANGUAGES);
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={tailwind.style('flex flex-row items-center')}>
        <Animated.View
          style={tailwind.style(
            'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
            index !== languagesList.length - 1 ? 'border-b-[1px] border-blackA-A3' : '',
          )}>
          <Animated.Text
            style={tailwind.style(
              'text-base capitalize text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px]',
            )}>
            {item.title}
          </Animated.Text>
          {currentLanguage === item.key ? <Icon icon={<TickIcon />} size={20} /> : null}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export const LanguagesList = () => {
  return (
    <Animated.View style={tailwind.style('py-1 pl-3')}>
      {languagesList.map((item, index) => {
        return <LanguageCell key={index} {...{ item, index }} />;
      })}
    </Animated.View>
  );
};
