import {
  CHAT_PAGE_INDEX,
  NUTRIPLUS_CRM_PAGE_INDEX,
  getConversationActionsPageIndex,
} from './conversationPager';

describe('conversation pager layout', () => {
  it('uses Chat -> NutriPlus CRM -> Actions when NutriPlus is available', () => {
    expect(CHAT_PAGE_INDEX).toBe(0);
    expect(NUTRIPLUS_CRM_PAGE_INDEX).toBe(1);
    expect(getConversationActionsPageIndex(true)).toBe(2);
  });

  it('keeps Actions at index 1 when NutriPlus is unavailable', () => {
    expect(getConversationActionsPageIndex(false)).toBe(1);
  });
});
