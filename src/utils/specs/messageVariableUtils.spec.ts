import {
  allMessageVariables,
  replaceMessageVariables,
  getAllUndefinedVariablesInMessage,
} from '@/utils/messageVariableUtils';
import { Conversation } from '@/types';

const buildConversation = (overrides: Record<string, unknown> = {}): Conversation => {
  return {
    id: 11306,
    accountId: 1,
    additionalAttributes: {},
    agentLastSeenAt: 1,
    assigneeLastSeenAt: 1,
    canReply: true,
    contactLastSeenAt: 1,
    createdAt: 1,
    customAttributes: {},
    firstReplyCreatedAt: 1,
    inboxId: 1,
    labels: [],
    lastActivityAt: 1,
    muted: false,
    priority: 'low',
    snoozedUntil: null,
    status: 'open',
    unreadCount: 0,
    uuid: 'test-uuid',
    waitingSince: 1,
    lastNonActivityMessage: null,
    messages: [],
    timestamp: 1,
    slaPolicyId: null,
    appliedSla: null,
    slaEvents: [],
    meta: {
      sender: {
        id: 11824,
        name: 'Solitary-Wave-900',
        thumbnail: '',
        email: 'test@example.com',
        phoneNumber: '+1234567890',
        additionalAttributes: {},
        customAttributes: {},
        createdAt: 1,
        identifier: null,
        lastActivityAt: 1,
        type: 'contact',
      },
      assignee: {
        id: 1,
        name: 'John Doe',
        thumbnail: '',
        email: 'john@example.com',
        customAttributes: {},
      },
      team: null,
      hmacVerified: false,
      channel: 'Channel::Whatsapp',
    },
    ...overrides,
  } as Conversation;
};

describe('messageVariableUtils', () => {
  describe('allMessageVariables', () => {
    it('should return standard contact variables', () => {
      const conversation = buildConversation();
      const variables = allMessageVariables({ conversation });

      expect(variables['contact.name']).toBe('Solitary-Wave-900');
      expect(variables['contact.first_name']).toBe('Solitary-Wave-900');
      expect(variables['contact.email']).toBe('test@example.com');
      expect(variables['contact.id']).toBe(11824);
      expect(variables['conversation.id']).toBe(11306);
    });

    it('should return standard agent variables', () => {
      const conversation = buildConversation();
      const variables = allMessageVariables({ conversation });

      expect(variables['agent.name']).toBe('John Doe');
      expect(variables['agent.first_name']).toBe('John');
      expect(variables['agent.last_name']).toBe('Doe');
      expect(variables['agent.email']).toBe('john@example.com');
    });

    it('should map contact.phone from camelCase phoneNumber', () => {
      const conversation = buildConversation();
      const variables = allMessageVariables({ conversation });

      expect(variables['contact.phone']).toBe('+1234567890');
    });

    it('should convert camelCase conversation custom attribute keys to snake_case', () => {
      const conversation = buildConversation({
        customAttributes: { regNumber: '121212', planType: 'premium' },
      });
      const variables = allMessageVariables({ conversation });

      expect(variables['conversation.custom_attribute.reg_number']).toBe('121212');
      expect(variables['conversation.custom_attribute.plan_type']).toBe('premium');
      // Should not have camelCase keys
      expect(variables['conversation.custom_attribute.regNumber']).toBeUndefined();
      expect(variables['conversation.custom_attribute.planType']).toBeUndefined();
    });

    it('should convert camelCase contact custom attribute keys to snake_case', () => {
      const conversation = buildConversation();
      // Override sender customAttributes
      (conversation.meta.sender as { customAttributes: Record<string, string> }).customAttributes = {
        userName: 'testuser',
        accountType: 'business',
      };
      const variables = allMessageVariables({ conversation });

      expect(variables['contact.custom_attribute.user_name']).toBe('testuser');
      expect(variables['contact.custom_attribute.account_type']).toBe('business');
      expect(variables['contact.custom_attribute.userName']).toBeUndefined();
    });

    it('should handle already snake_case custom attribute keys', () => {
      const conversation = buildConversation({
        customAttributes: { company_name: 'Acme Corp' },
      });
      const variables = allMessageVariables({ conversation });

      expect(variables['conversation.custom_attribute.company_name']).toBe('Acme Corp');
    });

    it('should preserve numeric boundaries when converting keys to snake_case', () => {
      const conversation = buildConversation({
        customAttributes: { addressLine1: '123 Main St', field2Value: 'test' },
      });
      (conversation.meta.sender as { customAttributes: Record<string, string> }).customAttributes = {
        phone2Type: 'mobile',
        line1Address: 'home',
      };
      const variables = allMessageVariables({ conversation });

      expect(variables['conversation.custom_attribute.address_line_1']).toBe('123 Main St');
      expect(variables['conversation.custom_attribute.field_2_value']).toBe('test');
      expect(variables['contact.custom_attribute.phone_2_type']).toBe('mobile');
      expect(variables['contact.custom_attribute.line_1_address']).toBe('home');
    });

    it('should handle empty custom attributes', () => {
      const conversation = buildConversation({
        customAttributes: {},
      });
      const variables = allMessageVariables({ conversation });

      expect(variables['contact.name']).toBe('Solitary-Wave-900');
      expect(variables['conversation.id']).toBe(11306);
    });

    it('should return empty object when conversation is null', () => {
      const variables = allMessageVariables({ conversation: null as unknown as Conversation });
      expect(variables).toEqual({});
    });
  });

  describe('replaceMessageVariables', () => {
    it('should replace conversation custom attribute variables in message', () => {
      const conversation = buildConversation({
        customAttributes: { regNumber: '121212' },
      });
      const variables = allMessageVariables({ conversation });

      const result = replaceMessageVariables({
        message: 'My register number is {{conversation.custom_attribute.reg_number}}',
        variables,
      });

      expect(result).toBe('My register number is 121212');
    });

    it('should replace contact custom attribute variables in message', () => {
      const conversation = buildConversation();
      (conversation.meta.sender as { customAttributes: Record<string, string> }).customAttributes = {
        userName: 'testuser',
      };
      const variables = allMessageVariables({ conversation });

      const result = replaceMessageVariables({
        message: 'Hello {{contact.custom_attribute.user_name}}, welcome!',
        variables,
      });

      expect(result).toBe('Hello testuser, welcome!');
    });

    it('should replace standard variables in message', () => {
      const conversation = buildConversation();
      const variables = allMessageVariables({ conversation });

      const result = replaceMessageVariables({
        message: 'Hi {{contact.name}}, your agent is {{agent.name}}',
        variables,
      });

      expect(result).toBe('Hi Solitary-Wave-900, your agent is John Doe');
    });

    it('should replace multiple custom attribute variables', () => {
      const conversation = buildConversation({
        customAttributes: { regNumber: '121212', planType: 'premium' },
      });
      const variables = allMessageVariables({ conversation });

      const result = replaceMessageVariables({
        message:
          'Reg: {{conversation.custom_attribute.reg_number}}, Plan: {{conversation.custom_attribute.plan_type}}',
        variables,
      });

      expect(result).toBe('Reg: 121212, Plan: premium');
    });

    it('should replace undefined variables with empty string', () => {
      const conversation = buildConversation();
      const variables = allMessageVariables({ conversation });

      const result = replaceMessageVariables({
        message: 'Value: {{conversation.custom_attribute.nonexistent}}',
        variables,
      });

      expect(result).toBe('Value: ');
    });
  });

  describe('getAllUndefinedVariablesInMessage', () => {
    it('should return undefined variables', () => {
      const conversation = buildConversation();
      const variables = allMessageVariables({ conversation });

      const result = getAllUndefinedVariablesInMessage({
        message: 'Hi {{contact.name}} {{conversation.custom_attribute.missing_field}}',
        variables,
      });

      expect(result).toEqual(['conversation.custom_attribute.missing_field']);
    });

    it('should return empty array when all variables are defined', () => {
      const conversation = buildConversation({
        customAttributes: { regNumber: '121212' },
      });
      const variables = allMessageVariables({ conversation });

      const result = getAllUndefinedVariablesInMessage({
        message: 'Hi {{contact.name}}, reg: {{conversation.custom_attribute.reg_number}}',
        variables,
      });

      expect(result).toEqual([]);
    });
  });
});
