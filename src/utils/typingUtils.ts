import { TypingUser } from '@/types';
import i18n from '@/i18n';

export const isContactTyping = (typingUsers: TypingUser[], userId: number) => {
  return typingUsers.some(user => user.id === userId && user.type === 'contact');
};

const capitalize = (name: string) => name.toString().replace(/^./, str => str.toUpperCase());

export const getTypingUsersText = ({ users }: { users: TypingUser[] }): string | undefined => {
  const count = users?.length ?? 0;
  if (count === 0) {
    return undefined;
  }
  if (count === 1) {
    return i18n.t('CONVERSATION.IS_TYPING', { name: capitalize(users[0].name) });
  }
  if (count === 2) {
    return i18n.t('CONVERSATION.ARE_TYPING_PAIR', {
      first: capitalize(users[0].name),
      second: capitalize(users[1].name),
    });
  }
  return i18n.t('CONVERSATION.OTHERS_ARE_TYPING', {
    name: capitalize(users[0].name),
    count: count - 1,
  });
};
