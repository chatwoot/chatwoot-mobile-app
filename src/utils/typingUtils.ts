import { TypingUser } from '@/types';

export const isContactTyping = (typingUsers: TypingUser[], userId: number) => {
  return typingUsers.some(user => user.id === userId && user.type === 'contact');
};

// A typing user can reach the client without a name.
const displayName = (user: TypingUser) =>
  String(user?.name ?? '').replace(/^./, str => str.toUpperCase());

export const getTypingUsersText = ({ users }: { users: TypingUser[] }) => {
  if (!users) {
    return '';
  }
  const isAnyoneTyping = users.length !== 0;
  if (isAnyoneTyping) {
    const count = users.length;
    if (count === 1) {
      const [user] = users;
      return `${displayName(user)} is typing`;
    }

    if (count === 2) {
      const [first, second] = users;
      return `${displayName(first)} and ${displayName(second)} are typing`;
    }

    const [user] = users;
    const rest = users.length - 1;
    return `${displayName(user)} and ${rest} others are typing`;
  }
  return false;
};
