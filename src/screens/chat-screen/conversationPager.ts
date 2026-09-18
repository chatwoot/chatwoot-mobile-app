export const CHAT_PAGE_INDEX = 0;
export const NUTRIPLUS_CRM_PAGE_INDEX = 1;

export function getConversationActionsPageIndex(hasNutriplusCrm: boolean) {
  return hasNutriplusCrm ? 2 : 1;
}
