import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { StackActions, useNavigation } from '@react-navigation/native';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useChatWindowContext, useRefsContext } from '@/context';
import { showToast } from '@/utils/toastUtils';
import i18n from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/hooks';
import type { AppDispatch } from '@/store';
import { conversationActions } from '@/store/conversation/conversationActions';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { selectSingleConversation } from '@/store/conversation/conversationSelectedSlice';
import { setActionState } from '@/store/conversation/conversationActionSlice';
import { CONVERSATION_STATUS } from '@/constants';
import { ConversationStatus } from '@/types/common/ConversationStatus';
import type { Conversation } from '@/types';
import { ChatHeader } from './ChatHeader';
import { DashboardList } from './DropdownMenu';
import { ImageSourcePropType } from 'react-native';
import { SLAStatus } from '@/types/common/SLA';
import { evaluateSLAStatus } from '@chatwoot/utils';
import { resetSentMessage } from '@/store/conversation/sendMessageSlice';
import { selectAllDashboardApps } from '@/store/dashboard-app/dashboardAppSlice';
import { selectUser } from '@/store/auth/authSelectors';
import { selectStageById, selectStages } from '@/store/funnel/funnelSelectors';
import { funnelActions } from '@/store/funnel/funnelActions';

// [conomni] задача C7: этап диалога лежит в `custom_attributes` (jsonb) под ключом
// `conomni_stage_id` — проверено по коду форка (app/services/conomni/funnel.rb:4,
// STAGE_KEY = 'conomni_stage_id'). Значение приходит СТРОКОЙ (jsonb), пустая строка и
// отсутствие ключа равнозначны «этапа нет» — это не ошибка. Чистая функция ради
// тестируемости (в проекте нет @testing-library, контейнер не рендерится в тестах).
export const resolveConversationStageId = (conversation?: Conversation | null): string | null => {
  const stageId = conversation?.customAttributes?.conomni_stage_id;
  return stageId ? stageId : null;
};

// [conomni] задача C7: тап по этапу в шапке — выбрать диалог (та же селекция, что у
// bulk-действий) и открыть общую шторку действий в состоянии 'Stage' (ветка уже заведена
// в ActionBottomSheet.tsx). Диалог ещё не загружен — тапать нечем, ничего не делаем.
export const openStageSheet = (
  dispatch: AppDispatch,
  conversation: Conversation | undefined,
  actionsModalSheetRef: React.RefObject<BottomSheetModal>,
): void => {
  if (!conversation) return;
  dispatch(selectSingleConversation(conversation));
  dispatch(setActionState('Stage'));
  actionsModalSheetRef.current?.present();
};

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

  const appliedSla = conversation?.appliedSla;

  // [conomni] задача C7: справочник этапов — из стора воронки (C2); если его ещё нет
  // (открыли чат напрямую из списка, минуя вкладку «Воронка»), подтягиваем один раз.
  const stages = useAppSelector(selectStages);
  const conversationStageId = resolveConversationStageId(conversation);
  const stage = useAppSelector(state =>
    conversationStageId ? selectStageById(state, conversationStageId) : undefined,
  );

  useEffect(() => {
    if (stages.length === 0) {
      dispatch(funnelActions.fetchStages());
    }
  }, [dispatch, stages.length]);

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

  const { chatPagerView, actionsModalSheetRef } = useRefsContext();
  const { pagerViewIndex } = useChatWindowContext();

  const handleStagePress = () => {
    openStageSheet(dispatch, conversation, actionsModalSheetRef);
  };

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
            title: 'Conversation Actions',
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
      stage={stage}
      onBackPress={handleBackPress}
      onContactDetailsPress={handleNavigationToContactDetails}
      onToggleChatStatus={toggleChatStatus}
      onStagePress={handleStagePress}
    />
  );
};
