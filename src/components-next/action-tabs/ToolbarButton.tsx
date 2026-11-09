import { Text, View } from 'react-native';

import { tailwind } from '@/theme';
import { Icon } from '../common';

const TINT = tailwind.color('blue-800') as string;
const DISABLED = tailwind.color('gray-600') as string;

type ToolbarButtonProps = {
  label: string;
  glyph: (props: { stroke?: string; strokeWidth?: number }) => JSX.Element;
  enabled: boolean;
};

export const ToolbarButton = ({ label, glyph: Glyph, enabled }: ToolbarButtonProps) => (
  <View
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled: !enabled }}
    style={tailwind.style('h-[50px] min-w-[72px] items-center justify-center gap-1')}>
    <Icon size={22} icon={<Glyph stroke={enabled ? TINT : DISABLED} strokeWidth={1.6} />} />
    <Text
      style={[
        tailwind.style('text-[11px] leading-[13px] font-inter-medium-24'),
        { color: enabled ? TINT : DISABLED },
      ]}>
      {label}
    </Text>
  </View>
);
