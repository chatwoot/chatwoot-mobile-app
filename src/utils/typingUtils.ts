import { TypingUser } from '@/types';

export const isContactTyping = (typingUsers: TypingUser[], userId: number) => {
  return typingUsers.some(user => user.id === userId && user.type === 'contact');
};
