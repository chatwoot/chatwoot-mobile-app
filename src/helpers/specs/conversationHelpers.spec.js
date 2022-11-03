import { applyFilters } from 'helpers/conversationHelpers';

describe('conversation helpers', () => {
  it('should return true if conversation status matches filter status', () => {
    const conversation = {
      status: 'open',
    };
    const filters = {
      conversationStatus: 'open',
    };
    expect(applyFilters(conversation, filters)).toBe(true);
  });

  it('should return false if conversation status does not match filter status', () => {
    const conversation = {
      status: 'open',
    };
    const filters = {
      conversationStatus: 'resolved',
    };
    expect(applyFilters(conversation, filters)).toBe(false);
  });

  it('should return true if conversation status matches filter status and inbox id matches', () => {
    const conversation = {
      status: 'open',
      inbox_id: 1,
    };
    const filters = {
      conversationStatus: 'open',
      inboxId: 1,
    };
    expect(applyFilters(conversation, filters)).toBe(true);
  });

  it('should return false if conversation status matches filter status and inbox id does not match', () => {
    const conversation = {
      status: 'open',
      inbox_id: 1,
    };
    const filters = {
      conversationStatus: 'open',
      inboxId: 2,
    };
    expect(applyFilters(conversation, filters)).toBe(false);
  });

  it('should return true if conversation status does not match filter status and inbox id matches', () => {
    const conversation = {
      status: 'open',
      inbox_id: 1,
    };
    const filters = {
      conversationStatus: 'resolved',
      inboxId: 1,
    };
    expect(applyFilters(conversation, filters)).toBe(false);
  });

  it('should return false if conversation status does not match filter status and inbox id does not match', () => {
    const conversation = {
      status: 'open',
      inbox_id: 1,
    };
    const filters = {
      conversationStatus: 'resolved',
      inboxId: 2,
    };
    expect(applyFilters(conversation, filters)).toBe(false);
  });
});
