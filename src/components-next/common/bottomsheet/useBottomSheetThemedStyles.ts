import { useMemo } from 'react';

import { tailwind, useAppTheme } from '@/theme';

export const useBottomSheetThemedStyles = () => {
  const { isDark } = useAppTheme();

  return useMemo(() => {
    const backgroundClass = isDark ? 'bg-grayDark-50' : 'bg-white';
    const handleIndicatorClass = isDark ? 'bg-whiteA-A6' : 'bg-blackA-A6';

    return {
      backgroundStyle: tailwind.style(backgroundClass),
      contentStyle: tailwind.style(backgroundClass),
      handleStyle: tailwind.style('p-0 h-4 pt-[5px]', backgroundClass),
      handleIndicatorStyle: tailwind.style(
        'overflow-hidden w-8 h-1 rounded-[11px]',
        handleIndicatorClass,
      ),
    };
  }, [isDark]);
};
