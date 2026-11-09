import React, { useMemo } from 'react';

import { useSideToolbar } from '@/context';
import { HEADER_ICON_COLOR, SideToolbarButton } from '@/components-next/side-toolbar';
import { GlassCircleButton } from '@/components-next/side-toolbar/GlassCircleButton';
import i18n from '@/i18n';
import { ChevronLeft } from '@/svg-icons';

import { PaneHeader } from './PaneHeader';

export const PageHeader = ({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
}) => {
  const backItem = useMemo(
    () => (
      <SideToolbarButton
        icon={<ChevronLeft stroke={HEADER_ICON_COLOR} strokeWidth={1.5} />}
        onPress={onBack}
        accessibilityLabel={i18n.t('CONVERSATION.HEADER.BACK')}
      />
    ),
    [onBack],
  );
  const isSide = useSideToolbar(backItem);
  return (
    <PaneHeader
      title={title}
      left={
        isSide ? undefined : (
          <GlassCircleButton
            icon={<ChevronLeft stroke={HEADER_ICON_COLOR} strokeWidth={1.5} />}
            onPress={onBack}
            accessibilityLabel={i18n.t('CONVERSATION.HEADER.BACK')}
          />
        )
      }
      right={right}
    />
  );
};
