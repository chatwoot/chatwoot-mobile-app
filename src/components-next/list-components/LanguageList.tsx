import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { LANGUAGES } from '@/constants';
import { TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useThemedStyles } from '@/hooks';
import { useHaptic } from '@/utils';
import { Icon } from '@/components-next/common';

export type LanguageItemType = {
  title: string;
  key: string;
};

type LanguageCellProps = {
  item: LanguageItemType;
  index: number;
  currentLanguage: string;
  onChangeLanguage: (locale: string) => void;
};

const languagesList = Object.keys(LANGUAGES).map(languageCode => {
  return {
    title: LANGUAGES[languageCode as keyof typeof LANGUAGES],
    key: languageCode,
  };
});

const LanguageCell = (props: LanguageCellProps) => {
  const { item, index, currentLanguage, onChangeLanguage } = props;
  const themedTailwind = useThemedStyles();
  const hapticSelection = useHaptic();
  const handlePress = () => {
    hapticSelection?.();
    onChangeLanguage(item.key);
  };

  const isLastItem = index === languagesList.length - 1;
  const isSelected = currentLanguage === item.key;

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={themedTailwind.style('flex flex-row items-center')}>
        <Animated.View
          style={themedTailwind.style(
            'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
            !isLastItem && 'border-b-[1px] border-blackA-A3',
          )}
        >
          <Animated.Text
            style={themedTailwind.style(
              'text-base capitalize text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px]',
            )}
          >
            {item.title}
          </Animated.Text>
          {isSelected && <Icon icon={<TickIcon />} size={20} />}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export const LanguageList = ({
  currentLanguage,
  onChangeLanguage,
}: {
  currentLanguage: string;
  onChangeLanguage: (locale: string) => void;
}) => {
  const themedTailwind = useThemedStyles();
  return (
    <Animated.View style={themedTailwind.style('pt-1 pb-4 pl-2')}>
      {languagesList.map((item, index) => {
        return <LanguageCell key={index} {...{ item, index, currentLanguage, onChangeLanguage }} />;
      })}
    </Animated.View>
  );
};
