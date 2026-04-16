export type CopilotActionKey =
  | 'professional'
  | 'casual'
  | 'straightforward'
  | 'confident'
  | 'friendly'
  | 'fix_spelling_grammar'
  | 'improve'
  | 'reply_suggestion'
  | 'summarize';

export type CopilotState = {
  isGenerating: boolean;
  generatedContent: string;
  showEditor: boolean;
  followUpContext: Record<string, unknown> | null;
  originalContent: string;
  error: string | null;
};

export type CopilotRewritePayload = {
  content: string;
  operation: string;
  conversationId: number;
};

export type CopilotSummarizePayload = {
  conversationId: number;
};

export type CopilotReplySuggestionPayload = {
  conversationId: number;
};

export type CopilotFollowUpPayload = {
  followUpContext: Record<string, unknown>;
  message: string;
  conversationId: number;
};

export type CopilotTaskResponse = {
  message: string;
  follow_up_context: Record<string, unknown>;
};
