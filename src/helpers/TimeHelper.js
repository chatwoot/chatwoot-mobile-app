import moment from 'moment';
import fromUnixTime from 'date-fns/fromUnixTime';
import format from 'date-fns/format';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

export const messageStamp = ({ time, dateFormat = 'h:mm a' }) => {
  const unixTime = fromUnixTime(time);
  return format(unixTime, dateFormat);
};

export const dynamicTime = ({ time }) => {
  const unixTime = fromUnixTime(time);
  return formatDistanceToNow(unixTime, { addSuffix: true });
};

export const timeAgo = ({ time }) => {
  const createdAt = moment(time * 1000);
  return createdAt.fromNow();
};
