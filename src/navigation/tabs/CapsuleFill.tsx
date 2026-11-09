import { Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { BlurView, BlurViewProps } from '@react-native-community/blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

import { tailwind } from '@/theme';
import { SIDE_TAB_BAR_WIDTH } from '@/constants';

const useLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();
// Wrapper clips blur; capsule keeps shadow.
export const CapsuleFill = ({
  blurAmount,
  blurType,
  radius = SIDE_TAB_BAR_WIDTH / 2,
}: BlurViewProps & { radius?: number }) =>
  useLiquidGlass ? (
    <GlassView
      glassEffectStyle="regular"
      isInteractive
      style={[tailwind.style('absolute inset-0'), { borderRadius: radius }]}
    />
  ) : (
    <Animated.View style={tailwind.style('absolute inset-0 rounded-full overflow-hidden')}>
      <BlurView {...{ blurAmount, blurType }} style={tailwind.style('flex-1 bg-white')} />
    </Animated.View>
  );
