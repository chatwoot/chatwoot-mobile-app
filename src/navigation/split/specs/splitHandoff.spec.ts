import { handOffToSplitView, takeSplitHandoff } from '../splitHandoff';

describe('splitHandoff', () => {
  it('passes the contact along with the conversation, once', () => {
    handOffToSplitView(229, 218);
    expect(takeSplitHandoff()).toEqual({ conversationId: 229, contactId: 218 });
    expect(takeSplitHandoff()).toBeNull();
  });

  it('hands off a conversation without a contact', () => {
    handOffToSplitView(230);
    expect(takeSplitHandoff()).toEqual({ conversationId: 230, contactId: undefined });
  });
});
