import { useTailwind } from '@/theme/useTailwind';
import { SafeAreaView } from 'react-native';
import Animated from 'react-native-reanimated';

import i18n from '@/i18n';
import { Button } from '../button';
import type { FallbackProps } from './FallbackContent';

export const PhoneFallback = ({ resetError }: FallbackProps) => {
  const tailwind = useTailwind();
  return (
    <SafeAreaView style={tailwind.style('flex-1 bg-white')}>
      <Animated.View style={tailwind.style('flex-1 items-center justify-center px-6')}>
        <Animated.Text
          style={tailwind.style(
            'text-lg font-inter-medium-24 tracking-[0.16px] text-gray-950 text-center',
          )}>
          {i18n.t('ERRORS.UNEXPECTED_TITLE')}
        </Animated.Text>
        <Animated.Text
          style={tailwind.style(
            'pt-2 text-md font-inter-420-20 tracking-[0.16px] text-gray-700 text-center',
          )}>
          {i18n.t('ERRORS.UNEXPECTED_DESCRIPTION')}
        </Animated.Text>
        <Animated.View style={tailwind.style('pt-6 w-full')}>
          <Button text={i18n.t('ERRORS.TRY_AGAIN')} handlePress={resetError} />
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};
