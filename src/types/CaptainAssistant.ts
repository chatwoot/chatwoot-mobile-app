export interface CaptainAssistant {
  id: number;
  name: string | null;
  description: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
  type: string;
}
