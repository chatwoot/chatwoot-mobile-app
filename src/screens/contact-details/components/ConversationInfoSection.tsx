import React, { useEffect, useState } from 'react';
import { Pressable, TextInput } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { useAppDispatch, useAppSelector } from '@/hooks';
import type { AppDispatch } from '@/store';
import { useRefsContext } from '@/context';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { selectStageById, selectStages } from '@/store/funnel/funnelSelectors';
import { funnelActions } from '@/store/funnel/funnelActions';
import type { UpdateConversationFunnelPayload } from '@/store/funnel/funnelTypes';
import type { Conversation } from '@/types';
import { showToast } from '@/utils/toastUtils';
import i18n from '@/i18n';
// [conomni] задача C8: та же шторка этапа, что C7 — переиспользуем контейнер шапки чата
// целиком, свою логику выбора этапа не пишем.
import {
  resolveConversationStageId,
  openStageSheet,
} from '@/screens/chat-screen/components/chat-header/ChatHeaderContainer';
import { resolveStageDisplay } from '@/screens/chat-screen/components/chat-header/ChatHeader';

/**
 * [conomni] задача C8: секция «Информация об обращении» на карточке контакта. Показывает
 * этап диалога (тап открывает ту же шторку выбора этапа, что и шапка чата, C7) и цену
 * (числовой ввод, сохранение по потере фокуса). Метки диалога сюда не дублируем — они уже
 * есть в панели действий диалога (см. задание).
 */

// [conomni] Секция имеет смысл только когда карточка контакта открыта ИЗ диалога
// (`conversationId` приходит из шапки чата) — при открытии по `contactId` обращения ещё
// нет. Чистая функция ради тестируемости (в проекте нет @testing-library).
export const shouldShowConversationInfoSection = (conversationId?: number | null): boolean =>
  Boolean(conversationId);

// [conomni] Цена диалога лежит там же, где этап (C7) — в custom_attributes (jsonb) под
// ключом conomni_price (проверено по коду форка,
// app/services/conomni/funnel.rb:5, PRICE_KEY). Сервер пишет её Float'ом при сохранении;
// значение из jsonb может прийти и числом, и строкой — та же грабля, что у stage_id.
// Отсутствие ключа/пустая строка/мусор — «цены нет», это не ошибка.
export const resolveConversationPrice = (conversation?: Conversation | null): number | null => {
  const raw = conversation?.customAttributes?.conomni_price;
  if (raw === undefined || raw === null || raw === '') return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

// [conomni] Payload обновления цены по blur. Пустой (или нечисловой) ввод стирает цену —
// контракт сервера (write_price в funnel_controller.rb): пустое значение параметра `price`
// удаляет ключ, иначе пишет `to_f`. Непустой числовой ввод парсится в число, чтобы в теле
// запроса ушло `price: 5000`, а не строка "5000" (см. FunnelService#updateConversationFunnel
// — ключ уходит как есть).
export const buildPriceUpdatePayload = (
  conversationId: number,
  rawValue: string,
): UpdateConversationFunnelPayload => {
  const trimmed = rawValue.trim();
  if (trimmed === '') {
    return { conversationId, price: '' };
  }
  const parsed = Number(trimmed);
  return { conversationId, price: Number.isFinite(parsed) ? parsed : '' };
};

// [conomni] Сохранение цены по потере фокуса поля — тот же принцип, что handleStageSelect
// в UpdateStage.tsx (C7): на ошибке тост CONOMNI.CONVERSATION_INFO.PRICE_FAILED, введённый
// текст в поле не сбрасываем (пользователь может поправить и уйти с поля снова).
export const handlePriceBlur = async (
  dispatch: AppDispatch,
  conversationId: number,
  rawValue: string,
): Promise<void> => {
  try {
    await dispatch(
      funnelActions.updateConversationFunnel(buildPriceUpdatePayload(conversationId, rawValue)),
    ).unwrap();
  } catch {
    showToast({ message: i18n.t('CONOMNI.CONVERSATION_INFO.PRICE_FAILED') });
  }
};

type ConversationInfoSectionProps = {
  conversationId: number;
};

export const ConversationInfoSection = ({ conversationId }: ConversationInfoSectionProps) => {
  const dispatch = useAppDispatch();
  const { actionsModalSheetRef } = useRefsContext();

  const conversation = useAppSelector(state => selectConversationById(state, conversationId));

  // [conomni] справочник этапов — из стора воронки (C2), тот же приём, что
  // ChatHeaderContainer.tsx: если чат открыли минуя вкладку «Воронка», подтягиваем один раз.
  const stages = useAppSelector(selectStages);
  const stageId = resolveConversationStageId(conversation);
  const stage = useAppSelector(state => (stageId ? selectStageById(state, stageId) : undefined));
  const stageDisplay = resolveStageDisplay(stage);

  useEffect(() => {
    if (stages.length === 0) {
      dispatch(funnelActions.fetchStages());
    }
  }, [dispatch, stages.length]);

  const price = resolveConversationPrice(conversation);
  const [priceInput, setPriceInput] = useState(price !== null ? String(price) : '');

  useEffect(() => {
    setPriceInput(price !== null ? String(price) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price]);

  const handleStagePress = () => {
    openStageSheet(dispatch, conversation, actionsModalSheetRef);
  };

  const handleBlur = () => {
    handlePriceBlur(dispatch, conversationId, priceInput);
  };

  return (
    <Animated.View>
      <Animated.View style={tailwind.style('pl-4 pb-3')}>
        <Animated.Text
          style={tailwind.style(
            'text-sm font-inter-medium-24 leading-[16px] tracking-[0.32px] text-gray-700',
          )}>
          {i18n.t('CONOMNI.CONVERSATION_INFO.TITLE')}
        </Animated.Text>
      </Animated.View>
      <Animated.View style={tailwind.style('rounded-[13px] mx-4 bg-white')}>
        <Pressable
          onPress={handleStagePress}
          style={tailwind.style(
            'flex flex-row items-center justify-between px-3 py-[11px] border-b-[1px] border-b-blackA-A3',
          )}>
          <Animated.Text
            style={tailwind.style(
              'text-base font-inter-420-20 leading-[22px] tracking-[0.16px] text-gray-950',
            )}>
            {i18n.t('CONOMNI.CONVERSATION_INFO.STAGE')}
          </Animated.Text>
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style(
              'text-base font-inter-normal-20 leading-[22px] tracking-[0.16px] text-gray-950',
            )}>
            {stageDisplay.label}
          </Animated.Text>
        </Pressable>
        <Animated.View
          style={tailwind.style('flex flex-row items-center justify-between px-3 py-[11px]')}>
          <Animated.Text
            style={tailwind.style(
              'text-base font-inter-420-20 leading-[22px] tracking-[0.16px] text-gray-950',
            )}>
            {i18n.t('CONOMNI.CONVERSATION_INFO.PRICE')}
          </Animated.Text>
          <TextInput
            value={priceInput}
            onChangeText={setPriceInput}
            onBlur={handleBlur}
            keyboardType="numeric"
            placeholder={i18n.t('CONOMNI.CONVERSATION_INFO.PRICE_PLACEHOLDER')}
            placeholderTextColor={tailwind.color('text-gray-600') as string}
            style={tailwind.style(
              'flex-1 ml-3 text-base font-inter-normal-20 leading-[22px] tracking-[0.16px] text-gray-950 text-right',
            )}
          />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};
