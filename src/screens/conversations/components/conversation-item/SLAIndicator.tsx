import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';

import { tailwind } from '@/theme';
import { NativeView } from '@/components-next/native-components';
import { SlaMissedIcon } from '@/svg-icons';
import { SLA, SLAStatus } from '@/types/common/SLA';
import { evaluateSLAStatus } from '@chatwoot/utils';
import { evaluateSLAStatus as evaluateDueSLAStatus, hasSLADueTimes } from '@/utils/slaUtils';
import i18n from '@/i18n';
import { IOS_LIST_TEXT, useIOSListText } from '@/utils';
import { useAppSelector } from '@/hooks';
import { selectConversationById } from '@/store/conversation/conversationSelectors';

const REFRESH_INTERVAL = 60000;

export const SLAIndicator = ({
  conversationId,
  slaPolicyId,
  appliedSla,
  appliedSlaConversationDetails,
  onSLAStatusChange,
}: {
  // Used to read the conversation's recorded SLA events, as the conversation header does.
  conversationId?: number;
  slaPolicyId: number;
  appliedSla: SLA;
  appliedSlaConversationDetails: {
    firstReplyCreatedAt: number;
    waitingSince: number;
    status: string;
  };
  onSLAStatusChange: (hasThreshold: boolean) => void;
}) => {
  const iosText = useIOSListText();
  // Recorded SLA misses: with these a missed SLA is measured from when it was missed (as in
  // the header), rather than from a due time that may belong to an earlier cycle.
  const slaEvents = useAppSelector(state =>
    conversationId ? selectConversationById(state, conversationId)?.slaEvents : undefined,
  );
  const [slaStatus, setSlaStatus] = useState<SLAStatus | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const updateSlaStatus = useCallback(() => {
    // Prefer the server's per-conversation due times (they account for business hours),
    // like the conversation header, so both show the same SLA status. Older servers
    // without due times are evaluated from the policy thresholds.
    if (hasSLADueTimes(appliedSla)) {
      const dueStatus = evaluateDueSLAStatus({
        appliedSla,
        chat: {
          status: appliedSlaConversationDetails.status,
          firstReplyCreatedAt: appliedSlaConversationDetails.firstReplyCreatedAt,
          waitingSince: appliedSlaConversationDetails.waitingSince,
        },
        slaEvents,
      });
      setSlaStatus(dueStatus);
      onSLAStatusChange(dueStatus?.threshold ? true : false);
      return;
    }
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
    onSLAStatusChange(status?.threshold ? true : false);
  }, [appliedSla, appliedSlaConversationDetails, onSLAStatusChange, slaEvents]);

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
          iosText && IOS_LIST_TEXT.footnote,
          slaStatus?.isSlaMissed ? 'text-ruby-800' : 'text-gray-800',
        )}>
        {`${sLAStatusText()}: ${slaStatus?.threshold}`}
      </Text>
    </NativeView>
  );
};
