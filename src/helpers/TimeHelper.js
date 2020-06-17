import moment from 'moment';
import i18n from '../i18n';

export const messageStamp = ({ time }) => {
  const createdAt = time * 1000;
  return moment(createdAt).format('h:mm A');
};

export const wootTime = ({ time }) => {
  const createdAt = time * 1000;
  return moment(createdAt);
};

export const dynamicTime = ({ time }) => {
  const createdAt = moment(time * 1000);
  const today = moment();
  const oneWeekOld = moment().subtract(6, 'days').startOf('day');

  const yesterday = moment(today).subtract(1, 'day');

  if (moment(createdAt).isSame(today, 'day')) {
    return createdAt.format('hh:mm a');
  }

  if (moment(createdAt).isSame(yesterday, 'day')) {
    return i18n.t('CONVERSATION.YESTERDAY');
  }
  if (createdAt.isAfter(oneWeekOld)) {
    return moment(createdAt).format('dddd');
  }
  return moment(createdAt).format('DD/MM/YYYY');
};

export const timeAgo = ({ time }) => {
  const createdAt = moment(time * 1000);
  return createdAt.fromNow();
};
