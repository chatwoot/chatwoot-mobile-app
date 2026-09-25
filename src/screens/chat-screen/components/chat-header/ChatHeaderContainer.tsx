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
import { evaluateSLAStatus } from '@chatwoot/utils';
import { resetSentMessage } from '@/store/conversation/sendMessageSlice';
import { selectAllDashboardApps } from '@/store/dashboard-app/dashboardAppSlice';
import { selectUser } from '@/store/auth/authSelectors';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import { selectHasActiveCall, selectHasIncomingCall } from '@/store/call/callSelectors';
import { callActions } from '@/store/call/callActions';
import { getVoiceCallProvider } from '@/utils/inboxUtils';
import { isMediaUnavailableError } from '@/services/voice/callEngine';
import { VOICE_CALL_PROVIDERS } from '@/constants';

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
  const inbox = useAppSelector(state =>
    conversation?.inboxId ? selectInboxById(state, conversation.inboxId) : undefined,
  );
  const hasActiveCall = useAppSelector(selectHasActiveCall);
  const hasIncomingCall = useAppSelector(selectHasIncomingCall);
  const [isStartingCall, setIsStartingCall] = useState(false);
  const voiceCallProvider = getVoiceCallProvider(inbox);

  const appliedSla = conversation?.appliedSla;

  const [slaStatus, setSlaStatus] = useState<SLAStatus | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const conversationStatus = conversation?.status;
  const isResolved = conversationStatus === CONVERSATION_STATUS.RESOLVED;

  const updateSlaStatus = useCallback(() => {
    if (appliedSla) {
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
          first_reply_created_at: conversation?.firstReplyCreatedAt,
          waiting_since: conversation?.waitingSince,
          status: conversation?.status,
        },
      });
      setSlaStatus(status);
    }
  }, [appliedSla, conversation]);

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

  // Mirrors the web header button: one call at a time, permission outcomes are
  // information rather than failures.
  const startCall = async () => {
    if (!voiceCallProvider || !inbox || isStartingCall) return;
    const isWhatsapp = voiceCallProvider === VOICE_CALL_PROVIDERS.WHATSAPP;
    setIsStartingCall(true);
    try {
      const result = await dispatch(
        callActions.startOutboundCall({
          provider: voiceCallProvider,
          conversationId,
          inboxId: inbox.id,
          contactId: conversation?.meta?.sender?.id,
        }),
      ).unwrap();
      if (result.status === 'permission_requested') {
        showToast({ message: i18n.t('CONVERSATION.HEADER.WHATSAPP_CALL_PERMISSION_REQUESTED') });
      } else if (result.status === 'permission_pending') {
        showToast({ message: i18n.t('CONVERSATION.HEADER.WHATSAPP_CALL_PERMISSION_PENDING') });
      }
    } catch (error) {
      if (isMediaUnavailableError(error)) {
        showToast({ message: i18n.t('CONVERSATION.HEADER.CALL_UNAVAILABLE') });
      } else {
        showToast({
          message: i18n.t(
            isWhatsapp
              ? 'CONVERSATION.HEADER.WHATSAPP_CALL_FAILED'
              : 'CONVERSATION.HEADER.VOICE_CALL_FAILED',
          ),
        });
      }
    } finally {
      setIsStartingCall(false);
    }
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

  const sLAStatusText = () => {
    const upperCaseType = slaStatus?.type?.toUpperCase(); // FRT, NRT, or RT
    const statusKey = slaStatus?.isSlaMissed ? 'MISSED' : 'DUE';
    return i18n.t(`SLA.STATUS.${upperCaseType}`, {
      status: i18n.t(`SLA.STATUS.${statusKey}`),
    });
  };
  return (
    <ChatHeader
      name={name}
      imageSrc={imageSrc}
      isResolved={isResolved}
      dashboardsList={dashboardsList}
      isSlaMissed={slaStatus?.isSlaMissed}
      hasSla={!!appliedSla}
      slaEvents={conversation?.slaEvents}
      statusText={`${sLAStatusText()}: ${slaStatus?.threshold}`}
      showCallButton={voiceCallProvider !== null}
      isCallDisabled={hasActiveCall || hasIncomingCall || isStartingCall}
      onCallPress={startCall}
      onBackPress={handleBackPress}
      onContactDetailsPress={handleNavigationToContactDetails}
      onToggleChatStatus={toggleChatStatus}
    />
  );
};
