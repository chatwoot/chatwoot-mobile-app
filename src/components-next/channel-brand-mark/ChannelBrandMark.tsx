import React from 'react';
import { Text, View } from 'react-native';

import { tailwind } from '@/theme';

/**
 * [conomni] Мобильный порт веб-знака канала — один в один логика и палитра
 * (conomni-chatwoot/app/javascript/dashboard/components/widgets/ChannelBrandMark.vue),
 * без тёмной темы (в мобильном приложении её нет — dark-классы не переносим).
 *
 * У всех наших коннекторных источников (MAX, ВКонтакте, Avito, Telegram, личный MAX) тип
 * инбокса одинаковый — Channel::Api, различает их только поле `conomni_channel`, которое
 * сервер кладёт в карточку `inbox`. Поддельные логотипы мессенджеров не рисуем (осознанное
 * продуктовое решение) — только буквенная плашка в фирменных цветах канала. Ради того же
 * принципа Telegram здесь тоже буква («TG»), а не иконка, — единообразно со всеми
 * остальными каналами и без риска, что svg-контур прочитают как чужой логотип.
 */

export type ChannelBrandMarkSize = 'sm' | 'md';

export interface ChannelBrandMarkInfo {
  /** Текст плашки. Отсутствует у нейтральной (fallback) плашки. */
  label?: string;
  /** Классы фона+текста, twrnc-литералы (динамически собирать нельзя — twrnc их не резолвит). */
  tone: string;
  /** true — незнакомый/отсутствующий канал, показывается нейтральная серая плашка. */
  isFallback?: boolean;
}

// Палитра — та же, что в веб-кабинете (лендинг `public/index.html`, класс `.chip`),
// светлые тона, чтобы сайт и оба кабинета читались как один продукт.
const MARKS: Record<string, ChannelBrandMarkInfo> = {
  max: { label: 'MAX', tone: 'bg-[#E8F0FF] text-[#2C4E93]' },
  vk: { label: 'VK', tone: 'bg-[#E9EEF9] text-[#37578C]' },
  avito: { label: 'AV', tone: 'bg-[#FDECE6] text-[#A4432A]' },
  telegram: { label: 'TG', tone: 'bg-[#E4F2FA] text-[#26688C]' },
  telegram_bot: { label: 'TG', tone: 'bg-[#E4F2FA] text-[#26688C]' },
  max_personal: { label: 'MAX', tone: 'bg-[#E8F0FF] text-[#2C4E93]' },
};

// Незнакомый канал (или его полное отсутствие) не должен ронять экран — нейтральная плашка.
const FALLBACK: ChannelBrandMarkInfo = {
  tone: 'bg-gray-100 text-gray-700',
  isFallback: true,
};

const BOX_SIZE: Record<ChannelBrandMarkSize, string> = {
  sm: 'w-8 h-8 rounded-lg',
  md: 'w-12 h-12 rounded-xl',
};

const TEXT_SIZE: Record<ChannelBrandMarkSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
};

/**
 * Выбор знака — чистая функция, вынесена и экспортирована отдельно от компонента:
 * в проекте нет рендер-тестов components-next (@testing-library не подключена),
 * поэтому именно она и покрывается юнит-тестами.
 *
 * Порядок выбора ключа: сначала `channelKey` (значение `inbox.conomni_channel`); если
 * пусто — хвост `channelType` (значение `inbox.channel_type`, например
 * `'Channel::WebWidget'`) в нижнем регистре (`'webwidget'`). Незнакомый ключ и полное
 * отсутствие данных дают нейтральную плашку.
 */
export function resolveChannelBrandMark(
  channelKey: string | null | undefined,
  channelType: string | null | undefined,
): ChannelBrandMarkInfo {
  const key = channelKey || tailOfChannelType(channelType);
  if (!key) return FALLBACK;

  return MARKS[key] || FALLBACK;
}

function tailOfChannelType(channelType: string | null | undefined): string {
  if (!channelType) return '';
  const tail = channelType.split('::').pop() || '';
  return tail.toLowerCase();
}

export interface ChannelBrandMarkProps {
  /** `inbox.conomni_channel` с сервера. */
  channelKey?: string | null;
  /** `inbox.channel_type`, например `'Channel::WebWidget'`. Запасной вариант, если channelKey пуст. */
  channelType?: string;
  size?: ChannelBrandMarkSize;
}

export const ChannelBrandMark: React.FC<ChannelBrandMarkProps> = ({
  channelKey,
  channelType,
  size = 'sm',
}) => {
  const mark = resolveChannelBrandMark(channelKey, channelType);

  return (
    <View style={tailwind.style('items-center justify-center shrink-0', BOX_SIZE[size], mark.tone)}>
      <Text style={tailwind.style('font-inter-580-24', TEXT_SIZE[size], mark.tone)}>
        {mark.label}
      </Text>
    </View>
  );
};
