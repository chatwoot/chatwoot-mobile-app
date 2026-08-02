import { fromUnixTime, formatDistanceToNow, isSameDay, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import i18n from '@/i18n';
import { UnixTimestamp } from '@/types';

export const formatRelativeTime = (time: number) => {
  const unixTime = fromUnixTime(time);
  return formatDistanceToNow(unixTime, { addSuffix: true });
};

export const formatTimeToShortForm = (time: string, withAgo = false) => {
  const suffix = withAgo ? ' ago' : '';
  const timeMappings: { [key: string]: string } = {
    'less than a minute ago': 'now',
    'a minute ago': `1m${suffix}`,
    'an hour ago': `1h${suffix}`,
    'a day ago': `1d${suffix}`,
    'a month ago': `1mo${suffix}`,
    'a year ago': `1y${suffix}`,
  };
  // Check if the time string is one of the specific cases
  if (timeMappings[time]) {
    return timeMappings[time];
  }
  const convertToShortTime = time
    .replace(/about|over|almost|/g, '')
    .replace(' minute ago', `m${suffix}`)
    .replace(' minutes ago', `m${suffix}`)
    .replace(' hour ago', `h${suffix}`)
    .replace(' hours ago', `h${suffix}`)
    .replace(' day ago', `d${suffix}`)
    .replace(' days ago', `d${suffix}`)
    .replace(' month ago', `mo${suffix}`)
    .replace(' months ago', `mo${suffix}`)
    .replace(' year ago', `y${suffix}`)
    .replace(' years ago', `y${suffix}`);
  return convertToShortTime;
};

export const formatDate = (date: UnixTimestamp, dateFormat = 'MMM dd, yyyy') => {
  const dateObj = fromUnixTime(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(dateObj, today)) {
    return i18n.t('CONVERSATION.TODAY');
  }
  if (isSameDay(dateObj, yesterday)) {
    return i18n.t('CONVERSATION.YESTERDAY');
  }
  return format(dateObj, dateFormat);
};

// [conomni] m9: 24-часовой формат + русская локаль вместо 'h:mm a' (было «08:52 AM» —
// продукт русский, в вебе давно 24-часовой формат). Единственное место, где строится строка
// времени сообщения; unixTimestampToReadableTime — тонкая обёртка поверх него для мест,
// принимающих просто timestamp (см. CLAUDE.md: централизованный хелпер, а не правка в каждом компоненте).
export const messageStamp = ({
  time,
  dateFormat = 'HH:mm',
}: {
  time: number;
  dateFormat?: string;
}) => {
  const unixTime = fromUnixTime(time);
  return format(unixTime, dateFormat, { locale: ru });
};

export const unixTimestampToReadableTime = (unixTimestamp: number) =>
  messageStamp({ time: unixTimestamp });
