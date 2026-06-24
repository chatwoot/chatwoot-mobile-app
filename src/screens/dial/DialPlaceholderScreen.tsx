import React from 'react';
import { StatusBar } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import i18n from '@/i18n';
import { PhoneIcon } from '@/svg-icons';
import { tailwind } from '@/theme';

const KEY_SIZE = 76;

const keypadRows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
];

const DialPlaceholderScreen = () => {
  return (
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-white')}
        barStyle={'dark-content'}
      />
      <Animated.View style={tailwind.style('px-4 pt-3 pb-4')}>
        <Animated.Text
          style={tailwind.style(
            'text-[28px] font-inter-580-24 leading-[34px] tracking-[0.16px] text-gray-950',
          )}>
          {i18n.t('DIAL.TITLE')}
        </Animated.Text>
      </Animated.View>
      <Animated.View style={tailwind.style('px-8 pt-8')}>
        <Animated.View
          style={tailwind.style(
            'h-[54px] flex-row items-center justify-between rounded-[13px] bg-gray-50 px-4',
          )}>
          <Animated.Text
            style={tailwind.style(
              'text-sm font-inter-medium-24 leading-[18px] tracking-[0.16px] text-gray-700',
            )}>
            {i18n.t('DIAL.CALLING_AS_LABEL')}
          </Animated.Text>
          <Animated.Text
            style={tailwind.style(
              'text-base font-inter-medium-24 leading-[21px] tracking-[0.16px] text-gray-950',
            )}>
            Chatwoot
          </Animated.Text>
        </Animated.View>
        <Animated.View style={tailwind.style('pt-10 gap-4')}>
          {keypadRows.map(row => (
            <Animated.View key={row.join('')} style={tailwind.style('flex-row justify-between')}>
              {row.map(key => (
                <Animated.View
                  key={key}
                  style={tailwind.style(
                    `h-[${KEY_SIZE}px] w-[${KEY_SIZE}px] items-center justify-center rounded-full bg-gray-50`,
                  )}>
                  <Animated.Text
                    style={tailwind.style(
                      'text-[28px] font-inter-420-20 leading-[34px] text-gray-400',
                    )}>
                    {key}
                  </Animated.Text>
                </Animated.View>
              ))}
            </Animated.View>
          ))}
        </Animated.View>
        <Animated.View
          style={tailwind.style(
            'mt-8 h-[56px] w-[56px] self-center items-center justify-center rounded-full bg-gray-50',
          )}>
          <PhoneIcon stroke={tailwind.color('text-gray-400')} />
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default DialPlaceholderScreen;
