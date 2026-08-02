import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

import { useRefsContext } from '@/context';
import { tailwind } from '@/theme';
import { useHaptic } from '@/utils';
import { BottomSheetHeader, Icon } from '@/components-next';
import { TickIcon } from '@/svg-icons/common';
import { useAppDispatch, useAppSelector } from '@/hooks';
import type { AppDispatch } from '@/store';
import { selectSelectedConversation } from '@/store/conversation/conversationSelectedSlice';
import { selectStages } from '@/store/funnel/funnelSelectors';
import { funnelActions } from '@/store/funnel/funnelActions';
import type { UpdateConversationFunnelPayload } from '@/store/funnel/funnelTypes';
import { conversationActions } from '@/store/conversation/conversationActions';
import { showToast } from '@/utils/toastUtils';
import i18n from '@/i18n';

/**
 * [conomni] задача C7: шторка выбора этапа воронки из шапки диалога. Список — «Без этапа»
 * (снять этап) + все этапы аккаунта (цветная точка + название), текущий отмечен галочкой.
 * Структура и стиль повторяют UpdateStatus.tsx (образец, указанный в задаче).
 */

type StageCellValue = {
  id: number | null;
  name: string;
  color: string | null;
};

// [conomni] Payload обновления этапа — чистая функция ради тестируемости (в проекте нет
// рендер-тестов компонентов, см. ChannelBrandMark.spec.ts / FunnelScreen.spec.ts — та же
// причина и тот же приём).
export const stageUpdatePayload = (
  conversationId: number,
  stageId: number | string | null,
): UpdateConversationFunnelPayload => ({ conversationId, stageId });

// [conomni] Выбор этапа: отправляет обновление на сервер; при успехе перечитывает диалог
// (проще и надёжнее, чем разбирать custom_attributes из ответа PATCH карточки воронки —
// шапка сама подхватит новый этап через conversation.customAttributes.conomni_stage_id) и
// закрывает шторку. При ошибке — тост CONOMNI.STAGE.UPDATE_FAILED, шторка остаётся
// открытой, чтобы можно было попробовать снова (тот же принцип, что у форм ввода цены на
// вебе — см. FunnelInfo.vue в форке).
export const handleStageSelect = async (
  dispatch: AppDispatch,
  conversationId: number,
  stageId: number | string | null,
  actionsModalSheetRef: React.RefObject<BottomSheetModal>,
): Promise<void> => {
  try {
    await dispatch(
      funnelActions.updateConversationFunnel(stageUpdatePayload(conversationId, stageId)),
    ).unwrap();
    dispatch(conversationActions.fetchConversation(conversationId));
    actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
  } catch {
    showToast({ message: i18n.t('CONOMNI.STAGE.UPDATE_FAILED') });
  }
};

type StageCellProps = {
  value: StageCellValue;
  isCurrent: boolean;
  isLastItem: boolean;
  onPress: () => void;
};

const StageCell = (props: StageCellProps) => {
  const { value, isCurrent, isLastItem, onPress } = props;
  return (
    <Pressable onPress={onPress} style={tailwind.style('flex flex-row items-center')}>
      <Animated.View
        style={[
          tailwind.style('h-3 w-3 rounded-full ml-1'),
          { backgroundColor: value.color ?? (tailwind.color('bg-gray-400') as string) },
        ]}
      />
      <Animated.View
        style={tailwind.style(
          'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
          !isLastItem ? 'border-b-[1px] border-blackA-A3' : '',
        )}>
        <Animated.Text
          style={tailwind.style(
            'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px]',
          )}>
          {value.name}
        </Animated.Text>
        {isCurrent ? <Icon icon={<TickIcon />} size={20} /> : null}
      </Animated.View>
    </Pressable>
  );
};

export const UpdateStage = () => {
  const { actionsModalSheetRef } = useRefsContext();
  const dispatch = useAppDispatch();
  const hapticSelection = useHaptic();

  const stages = useAppSelector(selectStages);
  const selectedConversation = useAppSelector(selectSelectedConversation);

  // custom_attributes — jsonb, ключ может прийти и числом, и строкой (грабля W2/funnelSelectors).
  const currentStageId = selectedConversation?.customAttributes?.conomni_stage_id ?? null;

  const stageList: StageCellValue[] = [
    { id: null, name: i18n.t('CONOMNI.STAGE.NONE'), color: null },
    ...stages.map(stage => ({ id: stage.id, name: stage.name, color: stage.color })),
  ];

  const handleStagePress = (stageId: number | null) => {
    hapticSelection?.();
    if (!selectedConversation?.id) return;
    handleStageSelect(dispatch, selectedConversation.id, stageId, actionsModalSheetRef);
  };

  return (
    <BottomSheetView>
      <BottomSheetHeader headerText={i18n.t('CONOMNI.STAGE.SHEET_TITLE')} />
      <Animated.View style={tailwind.style('py-1 pl-3')}>
        {stageList.map((value, index) => (
          <StageCell
            key={value.id ?? 'none'}
            value={value}
            isCurrent={String(value.id) === String(currentStageId ?? null)}
            isLastItem={index === stageList.length - 1}
            onPress={() => handleStagePress(value.id)}
          />
        ))}
      </Animated.View>
    </BottomSheetView>
  );
};
