import { findConversationLinkFromPush } from '../PushHelper';

describe('findConversationLinkFromPush', () => {
  it('should return conversation link if notification_type is conversation_creation', () => {
    const notification =
      '{"id":8687,"notification_type":"conversation_creation","primary_actor_id":14902,"primary_actor_type":"Conversation","primary_actor":{"id":14428}}';
    const installationUrl = 'https://app.chatwoot.com';
    const result = findConversationLinkFromPush({ notification, installationUrl });
    expect(result).toBe(
      'https://app.chatwoot.com/app/accounts/1/conversations/14428/14902/Conversation',
    );
  });
  it('should return conversation link if notification_type is conversation_assignment', () => {
    const notification =
      '{"id":8696,"notification_type":"conversation_assignment","primary_actor_id":3104,"primary_actor_type":"Conversation","primary_actor":{"id":2684}}';
    const installationUrl = 'https://app.chatwoot.com';
    const result = findConversationLinkFromPush({ notification, installationUrl });
    expect(result).toBe(
      'https://app.chatwoot.com/app/accounts/1/conversations/2684/3104/Conversation',
    );
  });

  it('should return conversation link if notification_type is assigned_conversation_new_message', () => {
    const notification =
      '{"id":8694,"notification_type":"assigned_conversation_new_message","primary_actor_id":58731,"primary_actor_type":"Message","primary_actor":{"conversation_id":14429,"id":58731}}';
    const installationUrl = 'https://app.chatwoot.com';
    const result = findConversationLinkFromPush({ notification, installationUrl });
    expect(result).toBe(
      'https://app.chatwoot.com/app/accounts/1/conversations/14429/58731/Message',
    );
  });

  it('should return conversation link if notification_type is conversation_mention', () => {
    const notification =
      '{"id":8690,"notification_type":"conversation_mention","primary_actor_id":58725,"primary_actor_type":"Message","primary_actor":{"conversation_id":14428,"id":58725}}';
    const installationUrl = 'https://app.chatwoot.com';
    const result = findConversationLinkFromPush({ notification, installationUrl });
    expect(result).toBe(
      'https://app.chatwoot.com/app/accounts/1/conversations/14428/58725/Message',
    );
  });

  it('should return conversation link if notification_type is participating_conversation_new_message', () => {
    const notification =
      '{"id":8678,"notification_type":"participating_conversation_new_message","primary_actor_id":58712,"primary_actor_type":"Message","primary_actor":{"conversation_id":14427,"id":58712}}';

    const installationUrl = 'https://app.chatwoot.com';
    const result = findConversationLinkFromPush({ notification, installationUrl });
    expect(result).toBe(
      'https://app.chatwoot.com/app/accounts/1/conversations/14427/58712/Message',
    );
  });
  it('should return nothing if notification_type is not valid', () => {
    const notification =
      '{"id":8678,"notification_type":"participating_conversation_message","primary_actor_id":58712,"primary_actor_type":"Message","primary_actor":{"conversation_id":14427,"id":58712}}';

    const installationUrl = 'https://app.chatwoot.com';
    const result = findConversationLinkFromPush({ notification, installationUrl });
    expect(result).toBe(undefined);
  });
});
