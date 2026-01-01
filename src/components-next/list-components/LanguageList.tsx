import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { AVAILABLE_LANGUAGES } from '@/constants';
import { TickIcon } from '@/svg-icons';
import { tailwind, useThemedStyles } from '@/theme';
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

const languagesList = Object.keys(AVAILABLE_LANGUAGES).map(languageCode => {
  return {
    title: AVAILABLE_LANGUAGES[languageCode as keyof typeof AVAILABLE_LANGUAGES],
    key: languageCode,
  };
});

const LanguageCell = (props: LanguageCellProps) => {
  const { item, index, currentLanguage, onChangeLanguage } = props;
  const hapticSelection = useHaptic();
  const styles = useThemedStyles();

  const handlePress = () => {
    hapticSelection?.();
    onChangeLanguage(item.key);
  };

  const isLastItem = index === languagesList.length - 1;
  const isSelected = currentLanguage === item.key;

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={tailwind.style('flex flex-row items-center')}>
        <Animated.View
          style={[
            tailwind.style('flex-1 ml-3 flex-row justify-between py-[11px] pr-3'),
            !isLastItem && { borderBottomWidth: 1, ...styles.border },
          ]}
        >
          <Animated.Text
            style={[
              tailwind.style(
                'text-base capitalize font-inter-420-20 leading-[21px] tracking-[0.16px]',
              ),
              styles.textPrimary,
            ]}
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
  return (
    <Animated.View style={tailwind.style('pt-1 pb-4 pl-2')}>
      {languagesList.map((item, index) => {
        return <LanguageCell key={index} {...{ item, index, currentLanguage, onChangeLanguage }} />;
      })}
    </Animated.View>
  );
};
