import { fromUnixTime, formatDistanceToNow } from 'date-fns';

export const getDynamicTime = (time: number) => {
  const unixTime = fromUnixTime(time);
  return formatDistanceToNow(unixTime, { addSuffix: true });
};
