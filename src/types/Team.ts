export interface Team {
  id: string;
  name: string;
  description: string | null;
  allowAutoAssign: boolean;
  accountId: number;
  isMember: boolean;
}
