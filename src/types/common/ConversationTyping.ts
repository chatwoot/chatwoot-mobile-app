import { Conversation } from '@/types';

export interface TypingData {
  account_id: number;
  conversation: Conversation;
  user: TypingUser;
}

export type TypingUser = UserTyping | ContactTyping;

export type TypingUserType = 'user' | 'contact';

interface UserTyping {
  availabilityStatus: string;
  availableName: string;
  avatarUrl: string;
  id: number;
  name: string;
  thumbnail: string;
  type: TypingUserType;
}

interface ContactTyping {
  email: string | null;
  id: number;
  name: string;
  phoneNumber: string | null;
  thumbnail: string;
  type: TypingUserType;
}
