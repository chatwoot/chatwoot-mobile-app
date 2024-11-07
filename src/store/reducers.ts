import { combineReducers } from 'redux';

import authSlice from '@/store/auth/authSlice';
import settingsSlice from '@/store/settings/settingsSlice';
import notificationSlice from '@/store/notification/notificationSlice';
import conversationFilterSlice from '@/store/conversation/conversationFilterSlice';
import selectedConversationSlice from '@/store/conversation/selectedConversationSlice';
import conversationHeaderSlice from '@/store/conversation/conversationHeaderSlice';
import conversationActionSlice from '@/store/conversation/conversationActionSlice';

import inboxSlice from '@/reducer/inboxSlice';
import cannedResponseSlice from '@/reducer/cannedResponseSlice';
// import conversationSlice from '@/reducer/conversationSlice';
import inboxAgentsSlice from '@/reducer/inboxAgentsSlice';
import conversationTypingSlice from '@/reducer/conversationTypingSlice';
import labelSlice from '@/reducer/labelSlice';
import conversationLabelsSlice from '@/reducer/conversationLabelSlice';
import teamSlice from '@/reducer/teamSlice';
import customAttributeSlice from '@/reducer/customAttributeSlice';
import dashboardAppSlice from '@/reducer/dashboardAppSlice';
import conversationWatchersSlice from '@/reducer/conversationWatchersSlice';
import contactsSlice from '@/reducer/contactSlice';

export const appReducer = combineReducers({
  auth: authSlice,
  notifications: notificationSlice,
  settings: settingsSlice,
  conversationFilter: conversationFilterSlice,
  selectedConversation: selectedConversationSlice,
  conversationHeader: conversationHeaderSlice,
  conversationAction: conversationActionSlice,

  cannedResponses: cannedResponseSlice,
  // conversations: conversationSlice,
  labels: labelSlice,
  conversationLabels: conversationLabelsSlice,
  customAttributes: customAttributeSlice,
  inboxes: inboxSlice,
  inboxAgents: inboxAgentsSlice,
  conversationTypingStatus: conversationTypingSlice,
  teams: teamSlice,
  dashboardApps: dashboardAppSlice,
  conversationWatchers: conversationWatchersSlice,
  contacts: contactsSlice,
});
