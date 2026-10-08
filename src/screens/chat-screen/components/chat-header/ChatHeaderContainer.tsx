import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { StackActions, useNavigation } from '@react-navigation/native';
import { useChatWindowContext, useRefsContext } from '@/context';
import { showToast } from '@/utils/toastUtils';
import i18n from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { conversationActions } from '@/store/conversation/conversationActions';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { CONVERSATION_STATUS } from '@/constants';
import { ConversationStatus } from '@/types/common/ConversationStatus';
import { ChatHeader } from './ChatHeader';
import { DashboardList } from './DropdownMenu';
import { ImageSourcePropType } from 'react-native';
import { SLAStatus } from '@/types/common/SLA';
import { evaluateSLAStatus as evaluateLegacySLAStatus } from '@chatwoot/utils';
import { evaluateSLAStatus, hasSLADueTimes } from '@/utils/slaUtils';
import { resetSentMessage } from '@/store/conversation/sendMessageSlice';
import { selectAllDashboardApps } from '@/store/dashboard-app/dashboardAppSlice';
import { selectUser } from '@/store/auth/authSelectors';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import { getChannelIcon } from '@/utils';
import { Channel } from '@/types';

type ChatScreenHeaderProps = {
  name: string;
  imageSrc: ImageSourcePropType;
};

const REFRESH_INTERVAL = 60000;

export const ChatHeaderContainer = (props: ChatScreenHeaderProps) => {
  const { name, imageSrc } = props;
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { conversationId } = useChatWindowContext();
  const conversation = useAppSelector(state => selectConversationById(state, conversationId));
  const currentUser = useAppSelector(selectUser);
  const dashboardApps = useAppSelector(selectAllDashboardApps);
  const inboxId = conversation?.inboxId;
  const inbox = useAppSelector(state => (inboxId ? selectInboxById(state, inboxId) : undefined));
  const channelIcon = inbox
    ? getChannelIcon(
        inbox.channelType as Channel,
        inbox.medium || '',
        conversation?.additionalAttributes?.type || '',
      )
    : null;

  const appliedSla = conversation?.appliedSla;

  const [slaStatus, setSlaStatus] = useState<SLAStatus | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const conversationStatus = conversation?.status;
  const isResolved = conversationStatus === CONVERSATION_STATUS.RESOLVED;

  const slaEvents = conversation?.slaEvents;

  const updateSlaStatus = useCallback(() => {
    if (!appliedSla) {
      setSlaStatus(null);
      return;
    }
    if (hasSLADueTimes(appliedSla)) {
      setSlaStatus(
        evaluateSLAStatus({
          appliedSla,
          chat: {
            status: conversation?.status,
            firstReplyCreatedAt: conversation?.firstReplyCreatedAt,
            waitingSince: conversation?.waitingSince,
          },
          slaEvents,
        }),
      );
      return;
    }
    // Servers without due-at timestamps are evaluated from the policy thresholds.
    const status = evaluateLegacySLAStatus({
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
        first_reply_created_at: conversation?.firstReplyCreatedAt,
        waiting_since: conversation?.waitingSince,
        status: conversation?.status,
      },
    });
    setSlaStatus(status);
  }, [appliedSla, conversation, slaEvents]);

  const { chatPagerView } = useRefsContext();
  const { pagerViewIndex } = useChatWindowContext();

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

  const handleBackPress = () => {
    dispatch(resetSentMessage());
    if (navigation.canGoBack()) {
      navigation.dispatch(StackActions.pop());
    } else {
      navigation.dispatch(StackActions.replace('Tab'));
    }
  };

  const handleNavigationToContactDetails = () => {
    const navigateToScreen = StackActions.push('ContactDetails', { conversationId });
    navigation.dispatch(navigateToScreen);
  };

  const handleNavigation = (url?: string, title?: string) => {
    if (url) {
      const navigateToScreen = StackActions.push('Dashboard', {
        url,
        title,
        conversation,
        currentUser,
      });
      navigation.dispatch(navigateToScreen);
    } else {
      chatPagerView.current?.setPage(1);
    }
  };

  const toggleChatStatus = async () => {
    const updatedStatus =
      conversationStatus === CONVERSATION_STATUS.RESOLVED
        ? CONVERSATION_STATUS.OPEN
        : CONVERSATION_STATUS.RESOLVED;
    await dispatch(
      conversationActions.toggleConversationStatus({
        conversationId,
        payload: { status: updatedStatus as ConversationStatus, snoozed_until: null },
      }),
    );

    showToast({
      message: i18n.t('CONVERSATION.STATUS_CHANGE'),
    });
  };

  const dashboardRoutes = dashboardApps.map(dashboardApp => ({
    title: dashboardApp.title,
    url: dashboardApp.content[0].url,
    onSelect: handleNavigation,
  }));

  const dashboardsList = useMemo(() => {
    return [
      pagerViewIndex === 0
        ? {
            title: i18n.t('CONVERSATION_ACTION.TITLE'),
            onSelect: handleNavigation,
          }
        : undefined,
      ...dashboardRoutes,
    ].filter((item): item is DashboardList => item !== undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagerViewIndex]);

  const slaType = slaStatus?.type?.toUpperCase();
  const isSlaMissed = !!slaStatus?.isSlaMissed;

  const slaStatusText = () => {
    if (!slaType) return '';
    const label = i18n.t(`SLA.STATUS.${slaType}`, {
      status: i18n.t(`SLA.STATUS.${isSlaMissed ? 'MISSED' : 'DUE'}`),
    });
    return slaStatus?.threshold ? `${label}: ${slaStatus.threshold}` : label;
  };
  return (
    <ChatHeader
      name={name}
      imageSrc={imageSrc}
      isResolved={isResolved}
      showDetailsRow={pagerViewIndex === 0}
      inboxName={inbox?.name}
      channelIcon={channelIcon}
      dashboardsList={dashboardsList}
      isSlaMissed={isSlaMissed}
      hasSla={!!appliedSla && !!slaType}
      slaType={slaType}
      slaEvents={slaEvents}
      statusText={slaStatusText()}
      onBackPress={handleBackPress}
      onContactDetailsPress={handleNavigationToContactDetails}
      onToggleChatStatus={toggleChatStatus}
    />
  );
};
