import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';

import { tailwind } from '@/theme';
import { NativeView } from '@/components-next/native-components';
import { SlaMissedIcon } from '@/svg-icons';
import { SLA, SLAEvent, SLAStatus } from '@/types/common/SLA';
import { evaluateSLAStatus } from '@/utils/slaUtils';
import i18n from '@/i18n';

const REFRESH_INTERVAL = 60000;

export const SLAIndicator = ({
  slaPolicyId,
  appliedSla,
  appliedSlaConversationDetails,
  slaEvents,
  onSLAStatusChange,
}: {
  slaPolicyId: number;
  appliedSla: SLA;
  appliedSlaConversationDetails: {
    firstReplyCreatedAt: number;
    waitingSince: number;
    status: string;
  };
  slaEvents?: SLAEvent[];
  onSLAStatusChange: (hasThreshold: boolean) => void;
}) => {
  const [slaStatus, setSlaStatus] = useState<SLAStatus | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const updateSlaStatus = useCallback(() => {
    const status = evaluateSLAStatus({
      appliedSla,
      chat: appliedSlaConversationDetails,
      slaEvents,
    });
    setSlaStatus(status);
    onSLAStatusChange(status?.threshold ? true : false);
  }, [appliedSla, appliedSlaConversationDetails, slaEvents, onSLAStatusChange]);

  const createTimer = useCallback(() => {
    timerRef.current = setTimeout(() => {
      updateSlaStatus();
      createTimer();
    }, REFRESH_INTERVAL);
  }, [updateSlaStatus]);

  useEffect(() => {
    createTimer();
    updateSlaStatus();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [createTimer, updateSlaStatus]);

  if (!slaStatus?.threshold) {
    return null;
  }

  const sLAStatusText = () => {
    const upperCaseType = slaStatus?.type?.toUpperCase(); // FRT, NRT, or RT
    return i18n.t(`SLA.${upperCaseType}`);
  };

  return (
    <NativeView style={tailwind.style('flex flex-row justify-center items-center')}>
      <SlaMissedIcon color={slaStatus?.isSlaMissed ? '#E13D45' : '#BBBBBB'} />
      <Text
        style={tailwind.style(
          'pl-1 text-sm leading-[20px] text-center',
          slaStatus?.isSlaMissed ? 'text-ruby-800' : 'text-gray-800',
        )}>
        {`${sLAStatusText()}: ${slaStatus?.threshold}`}
      </Text>
    </NativeView>
  );
};
