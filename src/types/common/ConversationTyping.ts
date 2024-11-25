export type TypingUser = UserTyping | ContactTyping;

interface UserTyping {
  availabilityStatus: string;
  availableName: string;
  avatarUrl: string;
  id: number;
  name: string;
  thumbnail: string;
  type: 'user';
}

interface ContactTyping {
  email: string | null;
  id: number;
  name: string;
  phoneNumber: string | null;
  thumbnail: string;
  type: 'contact';
}
