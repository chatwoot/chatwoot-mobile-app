import { useTailwind } from '@/theme/useTailwind';
import Animated from 'react-native-reanimated';

import { ErrorIcon } from '@/svg-icons';
import { Pressable } from 'react-native';
import i18n from '@/i18n';

export const PaneErrorState = ({
  title,
  onRetry,
  onClose,
}: {
  title: string;
  onRetry: () => void;
  onClose: () => void;
}) => {
  const tailwind = useTailwind();
  return (
    <Animated.View style={tailwind.style('flex-1 bg-gray-50 items-center justify-center px-8')}>
      <Animated.View style={tailwind.style('items-center gap-3 max-w-[320px]')}>
        <Animated.View style={tailwind.style('h-10 w-10 items-center justify-center')}>
          <Animated.View style={{ transform: [{ scale: 0.5 }] }}>
            <ErrorIcon />
          </Animated.View>
        </Animated.View>
        <Animated.Text
          style={tailwind.style(
            'text-[17px] leading-[22px] font-inter-semibold-20 text-gray-950 text-center',
          )}>
          {title}
        </Animated.Text>
        <Animated.Text
          style={tailwind.style(
            'text-[15px] leading-[20px] font-inter-normal-20 text-gray-700 text-center',
          )}>
          {i18n.t('CONVERSATION.NOT_FOUND.PANE_DESCRIPTION')}
        </Animated.Text>
        <Animated.View style={tailwind.style('flex-row items-center gap-2 mt-2')}>
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            style={({ pressed }) =>
              tailwind.style(
                'h-9 min-w-[88px] px-5 rounded-full items-center justify-center border border-blue-800 bg-blue-800',
                pressed && 'opacity-80',
              )
            }>
            <Animated.Text style={tailwind.style('text-[15px] font-inter-medium-24 text-white')}>
              {i18n.t('CONVERSATION.NOT_FOUND.RETRY')}
            </Animated.Text>
          </Pressable>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            style={({ pressed }) =>
              tailwind.style(
                'h-9 min-w-[88px] px-5 rounded-full items-center justify-center border border-gray-300 bg-white',
                pressed && 'opacity-80',
              )
            }>
            <Animated.Text style={tailwind.style('text-[15px] font-inter-medium-24 text-gray-950')}>
              {i18n.t('CONVERSATION.NOT_FOUND.CLOSE')}
            </Animated.Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};
