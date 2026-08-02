/**
 * [conomni] Строка списка чатов (C5, поток C мобильного паритета) — питается карточкой
 * `Card` от НАШЕГО серверного эндпоинта `conomni/chat_list` (см. src/store/chat-list).
 * Логика выбора текста/стиля вынесена в экспортируемые чистые функции — рендер-тестов
 * в проекте нет (нет @testing-library), они и покрываются юнит-тестами.
 */
import React from 'react';
import { Pressable, Text, View, ImageURISource } from 'react-native';

import { Avatar } from '@/components-next/common';
import { ChannelBrandMark } from '@/components-next/channel-brand-mark';
import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { unixTimestampToReadableTime } from '@/utils/dateTimeUtils';
import { urgencyRowStyle } from '@/utils/urgency';
import type { Card, ChatListTab } from '@/store/chat-list/chatListTypes';

/** Подпись "отвечает бот" — только на вкладке "Новые", и только пока диалог реально у бота. */
export function shouldShowBotAnswersLabel(
  card: Pick<Card, 'bot_answers'>,
  tab: ChatListTab,
): boolean {
  return tab === 'new' && card.bot_answers === true;
}

/** Индикатор непрочитанного — по количеству непрочитанных сообщений карточки. */
export function shouldShowUnreadIndicator(card: Pick<Card, 'unread_count'>): boolean {
  return (card.unread_count || 0) > 0;
}

/** Заливка строки по срочности — тонкая обёртка над общим хелпером светофора (W6). */
export function getRowUrgencyStyle(card: Pick<Card, 'urgency'>): string {
  return urgencyRowStyle(card?.urgency?.level);
}

/**
 * Параметры перехода на экран диалога по тапу строки. `card.id` — уже display_id
 * (см. контракт `Card` в chatListTypes.ts), пересчитывать не нужно, отдаём как есть.
 */
export function buildChatScreenParams(card: Pick<Card, 'id'>): { conversationId: number } {
  return { conversationId: card.id };
}

/**
 * Обработчик тапа по строке — вызывает переданную навигацию с параметрами диалога.
 * Принимает узкий тип (только `navigate`), а не весь `NavigationProp`, специально: этот
 * файл не должен зависеть от `@react-navigation/native` на уровне модуля, чтобы спека
 * могла подставить простой `jest.fn()` без реальной навигационной обвязки.
 */
export function handleRowPress(
  navigate: (screen: string, params: { conversationId: number }) => void,
  card: Pick<Card, 'id'>,
): void {
  navigate('ChatScreen', buildChatScreenParams(card));
}

export interface ChatListRowProps {
  card: Card;
  tab: ChatListTab;
  onPress: (card: Card) => void;
}

const ChatListRow: React.FC<ChatListRowProps> = ({ card, tab, onPress }) => {
  const showBotAnswers = shouldShowBotAnswersLabel(card, tab);
  const showUnread = shouldShowUnreadIndicator(card);
  const urgencyStyle = getRowUrgencyStyle(card);

  return (
    <Pressable
      onPress={() => onPress(card)}
      style={tailwind.style(
        'flex-row items-center px-4 py-3 gap-3 border-b-[1px] border-b-blackA-A3',
        urgencyStyle,
      )}>
      <View>
        <Avatar
          size="lg"
          name={card.contact?.name || ''}
          src={{ uri: card.contact?.thumbnail } as ImageURISource}
        />
        <View style={tailwind.style('absolute -bottom-1 -right-1')}>
          <ChannelBrandMark
            channelKey={card.inbox?.conomni_channel}
            channelType={card.inbox?.channel_type}
            size="sm"
          />
        </View>
      </View>

      <View style={tailwind.style('flex-1 gap-[2px]')}>
        <View style={tailwind.style('flex-row items-center justify-between')}>
          <Text
            numberOfLines={1}
            style={tailwind.style('flex-1 text-base font-inter-medium-24 text-gray-950')}>
            {card.contact?.name}
          </Text>
          {card.last_activity_at ? (
            <Text style={tailwind.style('text-xs text-gray-600 ml-2')}>
              {unixTimestampToReadableTime(card.last_activity_at)}
            </Text>
          ) : null}
        </View>

        <View style={tailwind.style('flex-row items-center justify-between')}>
          <Text
            numberOfLines={1}
            style={tailwind.style('flex-1 text-sm text-gray-700 leading-[18px]')}>
            {card.last_message?.content}
          </Text>
          {showUnread ? (
            <View
              style={tailwind.style(
                'ml-2 h-5 w-5 rounded-full bg-blue-700 items-center justify-center',
              )}>
              <Text style={tailwind.style('text-xs font-inter-semibold-20 text-white')}>
                {card.unread_count > 9 ? '9+' : card.unread_count}
              </Text>
            </View>
          ) : null}
        </View>

        {showBotAnswers ? (
          <Text style={tailwind.style('text-xs text-iris-700 font-inter-medium-24')}>
            {i18n.t('CONOMNI.CHAT_LIST.BOT_ANSWERS')}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
};

export default ChatListRow;
