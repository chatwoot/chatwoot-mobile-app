import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Auth persist config to exclude ephemeral MFA token and errors
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  blacklist: ['mfaToken', 'error'], // Exclude ephemeral MFA token and errors
};

// Apply persist config to auth reducer
const persistedAuthReducer = persistReducer(authPersistConfig, authSlice);

export const appReducer = combineReducers({
  auth: persistedAuthReducer,
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
