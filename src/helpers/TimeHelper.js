import moment from 'moment';

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
  return createdAt.fromNow();
};
