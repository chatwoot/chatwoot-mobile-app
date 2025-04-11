import { combineReducers } from 'redux';

import authSlice from '@/store/auth/authSlice';
import settingsSlice from '@/store/settings/settingsSlice';
import conversationFilterSlice from '@/store/conversation/conversationFilterSlice';
import conversationSelectedSlice from '@/store/conversation/conversationSelectedSlice';
import conversationHeaderSlice from '@/store/conversation/conversationHeaderSlice';
import conversationActionSlice from '@/store/conversation/conversationActionSlice';
import conversationSlice from '@/store/conversation/conversationSlice';
import inboxSlice from '@/store/inbox/inboxSlice';
import labelReducer from '@/store/label/labelSlice';
import contactSlice from '@/store/contact/contactSlice';
import assignableAgentSlice from '@/store/assignable-agent/assignableAgentSlice';
import conversationTypingSlice from '@/store/conversation/conversationTypingSlice';
import notificationSlice from '@/store/notification/notificationSlice';
import notificationFilterSlice from '@/store/notification/notificationFilterSlice';
import sendMessageSlice from '@/store/conversation/sendMessageSlice';
import audioPlayerSlice from '@/store/conversation/audioPlayerSlice';
import teamSlice from '@/store/team/teamSlice';
import contactLabelSlice from '@/store/contact/contactLabelSlice';
import contactConversationSlice from '@/store/contact/contactConversationSlice';
import dashboardAppSlice from '@/store/dashboard-app/dashboardAppSlice';
import customAttributeSlice from '@/store/custom-attribute/customAttributeSlice';
import conversationParticipantSlice from '@/store/conversation-participant/conversationParticipantSlice';
import localRecordedAudioCacheSlice from '@/store/conversation/localRecordedAudioCacheSlice';

import cannedResponseSlice from '@/store/canned-response/cannedResponseSlice';
import macroSlice from '@/store/macro/macroSlice';

export const appReducer = combineReducers({
  auth: authSlice,
  settings: settingsSlice,
  conversationFilter: conversationFilterSlice,
  selectedConversation: conversationSelectedSlice,
  conversationHeader: conversationHeaderSlice,
  conversations: conversationSlice,
  conversationAction: conversationActionSlice,
  contacts: contactSlice,
  labels: labelReducer,
  inboxes: inboxSlice,
  assignableAgents: assignableAgentSlice,
  conversationTyping: conversationTypingSlice,
  notifications: notificationSlice,
  notificationFilter: notificationFilterSlice,
  sendMessage: sendMessageSlice,
  audioPlayer: audioPlayerSlice,
  teams: teamSlice,
  macros: macroSlice,
  contactLabels: contactLabelSlice,
  contactConversations: contactConversationSlice,
  dashboardApps: dashboardAppSlice,
  customAttributes: customAttributeSlice,
  conversationParticipants: conversationParticipantSlice,
  cannedResponses: cannedResponseSlice,
  localRecordedAudioCache: localRecordedAudioCacheSlice,
});
