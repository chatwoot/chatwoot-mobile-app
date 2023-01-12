import moment from 'moment';
import fromUnixTime from 'date-fns/fromUnixTime';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

export const messageStamp = ({ time }) => {
  const createdAt = time * 1000;
  return moment(createdAt).format('h:mm A');
};

export const wootTime = ({ time }) => {
  const createdAt = time * 1000;
  return moment(createdAt);
};

export const dynamicTime = ({ time }) => {
  const unixTime = fromUnixTime(time);
  return formatDistanceToNow(unixTime, { addSuffix: true });
};

export const timeAgo = ({ time }) => {
  const createdAt = moment(time * 1000);
  return createdAt.fromNow();
};
