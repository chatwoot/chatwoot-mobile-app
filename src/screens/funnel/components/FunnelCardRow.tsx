import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';

import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { ChannelBrandMark } from '@/components-next/channel-brand-mark';
import { urgencyRowStyle } from '@/utils/urgency';
import { messageStamp } from '@/utils/dateTimeUtils';
import type { FunnelCard } from '@/store/funnel/funnelTypes';

/**
 * [conomni] Мобильный паритет, поток C — строка карточки воронки внутри вкладки этапа.
 * ВНИМАНИЕ (грабля W2/W5, актуальна и на телефоне): `last_message` у карточки ВОРОНКИ —
 * строка, а не объект, как у карточки списка чатов (@/store/chat-list) — не путать типы.
 */

/**
 * Цена показывается только когда она реально заполнена — сервер кладёт `null`, если цену
 * не проставили. Формат — целое число с разрядами по-русски + ₽ (цена сделки — целые
 * рубли, дробных не заводили ни в одной волне воронки). `toLocaleString('ru-RU')` разделяет
 * разряды НЕРАЗРЫВНЫМ пробелом (U+00A0) — заменяем на обычный, иначе разные части одного
 * числа могут перенестись переносом строки на узком экране.
 */
export function formatFunnelPrice(price: FunnelCard['price']): string | null {
  if (price === null || price === undefined) return null;
  const grouped = Math.round(price).toLocaleString('ru-RU').replace(/ /g, ' ');
  return `${grouped} ₽`;
}

export interface ChatScreenParams {
  conversationId: number;
}

// card.id карточки воронки — это display_id диалога (см. funnelTypes.ts), тот же
// идентификатор, который ждёт ChatScreen.
export function getChatScreenParams(card: Pick<FunnelCard, 'id'>): ChatScreenParams {
  return { conversationId: card.id };
}

// Переход через `dispatch(StackActions.push(...))`, а не `navigation.navigate(...)` — тот
// же паттерн, что уже используется в проекте (InboxItemContainer.tsx,
// ConversationItemContainer.tsx): типизированный `navigate` react-navigation не проходит
// tsc на строковом имени экрана без `as never`-каста.
// Тип параметра — узкий (только `dispatch`), а не `NavigationProp<ParamListBase>`: у
// `useNavigation()` в этом проекте фактический тип `NavigationProp<RootParamList>`, и он
// НЕ присваивается `NavigationProp<ParamListBase>` (несовместимость `getState()` —
// тот же баг уже есть в baseline на src/screens/search/SearchScreen.tsx:45). Минимальный
// интерфейс по одному методу эту яму обходит.
export interface FunnelNavigationLike {
  dispatch: (action: ReturnType<typeof StackActions.push>) => void;
}

export function handleCardPress(navigation: FunnelNavigationLike, card: FunnelCard): void {
  const pushToChatScreen = StackActions.push('ChatScreen', getChatScreenParams(card));
  navigation.dispatch(pushToChatScreen);
}

export interface FunnelCardRowProps {
  card: FunnelCard;
}

export const FunnelCardRow: React.FC<FunnelCardRowProps> = ({ card }) => {
  const navigation = useNavigation();
  const price = formatFunnelPrice(card.price);

  return (
    <Pressable
      onPress={() => handleCardPress(navigation, card)}
      style={tailwind.style(
        'flex-row items-center px-4 py-3 gap-3 border-b border-blackA-A3',
        urgencyRowStyle(card.urgency?.level),
      )}>
      <View style={tailwind.style('relative')}>
        {card.contact.thumbnail ? (
          <Image
            source={{ uri: card.contact.thumbnail }}
            style={tailwind.style('w-10 h-10 rounded-full')}
          />
        ) : (
          <View style={tailwind.style('w-10 h-10 rounded-full bg-gray-100')} />
        )}
        <View style={tailwind.style('absolute -bottom-1 -right-1')}>
          <ChannelBrandMark
            channelKey={card.inbox.conomni_channel}
            channelType={card.inbox.channel_type}
            size="sm"
          />
        </View>
      </View>
      <View style={tailwind.style('flex-1')}>
        <View style={tailwind.style('flex-row items-center justify-between')}>
          <Text
            numberOfLines={1}
            style={tailwind.style('flex-1 font-inter-medium-24 text-sm text-gray-950')}>
            {card.contact.name}
          </Text>
          {card.last_activity_at ? (
            <Text style={tailwind.style('text-xs text-gray-600 ml-2')}>
              {messageStamp({ time: card.last_activity_at })}
            </Text>
          ) : null}
        </View>
        <Text numberOfLines={1} style={tailwind.style('text-sm text-gray-700 mt-[2px]')}>
          {card.last_message}
        </Text>
        {price ? (
          <Text style={tailwind.style('text-xs text-gray-600 mt-1')}>
            {i18n.t('CONOMNI.FUNNEL.PRICE')}: {price}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
};
