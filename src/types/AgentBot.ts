type AgentBotType = 'webhook' | 'csml';

export interface AgentBot {
  id: number;
  name: string | null;
  description: string | null;
  outgoingUrl: string | null;
  botType: AgentBotType;
  botConfig: object | null;
  accountId: number | null;
  accessToken: string | null;
  thumbnail?: string | null;
  type: string;
}
