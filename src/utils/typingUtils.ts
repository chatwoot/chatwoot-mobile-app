import { TypingUser } from '@/types';

export const isContactTyping = (typingUsers: TypingUser[], userId: number) => {
  return typingUsers.some(user => user.id === userId && user.type === 'contact');
};

export const getTypingUsersText = ({ users }: { users: TypingUser[] }) => {
  if (!users) {
    return '';
  }
  const isAnyoneTyping = users.length !== 0;
  if (isAnyoneTyping) {
    const count = users.length;
    if (count === 1) {
      const [user] = users;
      const { type } = user;
      // Check user is typing
      if (type === 'contact') {
        return 'typing...';
      }
      return `${user.name.toString().replace(/^./, str => str.toUpperCase())} is typing...`;
    }

    if (count === 2) {
      const [first, second] = users;
      return `${first.name.toString().replace(/^./, str => str.toUpperCase())} and ${second.name
        .toString()
        .replace(/^./, str => str.toUpperCase())} are typing...`;
    }

    const [user] = users;
    const rest = users.length - 1;
    return `${user.name
      .toString()
      .replace(/^./, str => str.toUpperCase())} and ${rest} others are typing...`;
  }
  return false;
};
