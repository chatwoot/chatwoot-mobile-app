export interface AccountAPIResponse {
  id: number;
  features: Record<string, boolean>;
  settings: {
    conversation_required_attributes?: string[] | null;
  } | null;
}

export interface AccountResponse {
  features: Record<string, boolean>;
  conversationRequiredAttributes: string[];
}
