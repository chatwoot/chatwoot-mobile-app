import { useTailwind } from '@/theme/useTailwind';
import { Pressable } from 'react-native';

import { Icon } from '@/components-next/common';
import { CloseIcon } from '@/svg-icons';

export const RemoveRowButton = ({ onPress, label }: { onPress: () => void; label: string }) => {
  const tailwind = useTailwind();
  return (
    <Pressable
      hitSlop={8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) =>
        tailwind.style('h-7 w-7 ml-1 items-center justify-center', pressed && 'opacity-50')
      }>
      <Icon size={16} icon={<CloseIcon strokeWidth={1.5} />} />
    </Pressable>
  );
};
