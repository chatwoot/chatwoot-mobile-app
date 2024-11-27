import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';

import { tailwind } from '@/theme';
import { NativeView } from '@/components-next/native-components';
import { SlaMissedIcon } from '@/svg-icons';
import { SLA, SLAStatus } from '@/types/common/SLA';
import { evaluateSLAStatus } from '@chatwoot/utils';
import i18n from '@/i18n';

const REFRESH_INTERVAL = 60000;

export const SLAIndicator = ({
  slaPolicyId,
  appliedSla,
  appliedSlaConversationDetails,
}: {
  slaPolicyId: number;
  appliedSla: SLA;
  appliedSlaConversationDetails: {
    firstReplyCreatedAt: number;
    waitingSince: number;
    status: string;
  };
}) => {
  const [slaStatus, setSlaStatus] = useState<SLAStatus | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const updateSlaStatus = useCallback(() => {
    const status = evaluateSLAStatus({
      appliedSla: {
        id: appliedSla.id,
        name: appliedSla.slaName,
        description: appliedSla.slaDescription,
        sla_first_response_time_threshold: appliedSla.slaFirstResponseTimeThreshold,
        sla_next_response_time_threshold: appliedSla.slaNextResponseTimeThreshold,
        sla_resolution_time_threshold: appliedSla.slaResolutionTimeThreshold,
        only_during_business_hours: appliedSla.slaOnlyDuringBusinessHours,
        created_at: appliedSla.createdAt,
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      chat: {
        first_reply_created_at: appliedSlaConversationDetails.firstReplyCreatedAt,
        waiting_since: appliedSlaConversationDetails.waitingSince,
        status: appliedSlaConversationDetails.status,
      },
    });
    setSlaStatus(status);
  }, [appliedSla, appliedSlaConversationDetails]);

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

  const hasSlaThreshold = slaStatus?.threshold;

  if (!hasSlaThreshold) {
    return null;
  }

  // const isSlaMissed = slaStatus?.isSlaMissed;
  // const icon = isSlaMissed ? 'flame-outline' : 'alarm-outline';

  const sLAStatusText = () => {
    const upperCaseType = slaStatus?.type?.toUpperCase(); // FRT, NRT, or RT
    return i18n.t(`SLA.${upperCaseType}`);
  };

  return (
    <NativeView style={tailwind.style('flex flex-row justify-center items-center')}>
      <SlaMissedIcon />
      <Text style={tailwind.style('pl-1 text-ruby-800 text-sm leading-[20px] text-center')}>
        {`${sLAStatusText()}: ${slaStatus?.threshold}`}
      </Text>
    </NativeView>
  );
};
