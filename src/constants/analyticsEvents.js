export const CONVERSATION_EVENTS = Object.freeze({
  SENT_MESSAGE: 'Sent a message',
  SENT_PRIVATE_NOTE: 'Sent a private note',
  INSERTED_A_CANNED_RESPONSE: 'Inserted a canned response',
  SELECTED_ATTACHMENT: 'Select an attachment',
  USED_MENTIONS: 'Used mentions',
  ASSIGNEE_CHANGED: 'Conversation assignee changed',
  RESOLVE_CONVERSATION_STATUS: 'Conversation resolved',
  TOGGLE_STATUS: 'Changed conversation status',
  MUTE_CONVERSATION: 'Conversation muted',
  UN_MUTE_CONVERSATION: 'Conversation unmuted',
  UNASSIGN_CONVERSATION: 'Unassign conversation',
  CHANGE_TEAM: 'Changed team',
  REFRESH_CONVERSATIONS: 'Refreshed conversations',
  CLEAR_FILTERS: 'Clear conversation filters',
  APPLY_FILTER: 'Conversation filter applied',
  SELF_ASSIGN_CONVERSATION: 'Self assigned conversation',
});

export const ACCOUNT_EVENTS = Object.freeze({
  CHANGE_ACCOUNT: 'Changed account',
  ADDED_A_CUSTOM_ATTRIBUTE: 'Added a custom attribute',
  ADDED_AN_INBOX: 'Added an inbox',
  CHANGE_LANGUAGE: 'Changed language',
  OPEN_SUPPORT: 'Opened help support',
  CHANGE_URL: 'Changed URL',
});

export const LABEL_EVENTS = Object.freeze({
  CREATE: 'Created a label',
  UPDATE: 'Updated a label',
  DELETED: 'Deleted a label',
  APPLY_LABEL: 'Applied a label',
});

export const PROFILE_EVENTS = Object.freeze({
  TOGGLE_AVAILABILITY_STATUS: 'Changed availability status',
  CHANGE_PREFERENCES: 'Changed notification preferences',
});
