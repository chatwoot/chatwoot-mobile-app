export interface Team {
  id: number;
  name: string;
  description: string | null;
  allowAutoAssign: boolean;
  accountId: number;
  isMember: boolean;
}
