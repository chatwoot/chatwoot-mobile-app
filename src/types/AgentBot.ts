// json.id resource.id
// json.name resource.name
// json.description resource.description
// json.outgoing_url resource.outgoing_url
// json.bot_type resource.bot_type
// json.bot_config resource.bot_config
// json.account_id resource.account_id
// json.access_token resource.access_token if resource.access_token.present?

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
}
