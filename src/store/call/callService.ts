import type { AxiosRequestConfig } from 'axios';

import { apiService, type AccountScopedRequestConfig } from '@/services/APIService';

import type { IceServer } from './callTypes';

export type WhatsappCallResponse = {
  id: number;
  call_id: string;
  provider: 'whatsapp';
  status: string;
  direction: string;
  conversation_id: number;
  inbox_id: number;
  message_id: number;
  accepted_by_agent_id: number | null;
  elapsed_seconds: number | null;
  sdp_offer: string | null;
  ice_servers: IceServer[];
  recording_enabled: boolean;
  caller: { name: string | null; phone: string | null; avatar: string | null };
};

export type ConferenceTokenResponse = {
  token: string;
  identity: string;
  account_id: number;
  inbox_id: number;
};

export type ConferenceJoinResponse = {
  status: string;
  id: number;
  conference_sid: string;
  using_webrtc: boolean;
};

type ConferenceParams = {
  inboxId: number;
  conversationId: number;
  callSid: string;
  accountId?: number;
};

// A call that another agent took or that already ended answers with these; the call
// actions report them in their own words
const EXPECTED_CALL_ERRORS = [404, 409, 422];

// Scopes a request to the call's own account when it has one
const inAccount = (
  accountId: number | undefined,
  config: AxiosRequestConfig = {},
): AccountScopedRequestConfig => ({
  ...config,
  quietStatuses: EXPECTED_CALL_ERRORS,
  ...(accountId ? { accountId } : {}),
});

export type ContactCallResponse = {
  conversation_id: number;
  inbox_id: number;
  call_sid: string;
  conference_sid: string;
};

export type WhatsappInitiateResponse =
  | {
      status: 'calling';
      call_id: string;
      id: number;
      message_id: number;
      conversation_id: number;
      recording_enabled: boolean;
      provider: 'whatsapp';
    }
  | { status: 'permission_requested' | 'permission_pending'; conversation_id: number };

export type WhatsappInitiateParams = {
  sdpOffer: string;
  conversationId?: number;
  contactId?: number;
  inboxId?: number;
};

export type RingingCallResponse = {
  id: number;
  call_id: string;
  provider: 'whatsapp' | 'twilio';
  status: string;
  direction: 'inbound' | 'outbound';
  created_at: number;
  conversation: { id: number; display_id: number };
  inbox: { id: number; name: string };
  contact: {
    id: number;
    name: string | null;
    phone_number: string | null;
    avatar: string | null;
  } | null;
};

export class CallService {
  // The calls still ringing for this agent, which a phone that lost its socket catches up on
  static async getRingingCalls() {
    const response = await apiService.get<{ payload: RingingCallResponse[] }>('calls', {
      params: { status: 'ringing' },
    });
    return response.data.payload;
  }

  static async getWhatsappCall(id: number, accountId?: number) {
    const response = await apiService.get<WhatsappCallResponse>(
      `whatsapp_calls/${id}`,
      inAccount(accountId),
    );
    return response.data;
  }

  static async acceptWhatsappCall(id: number, sdpAnswer: string, accountId?: number) {
    const response = await apiService.post<WhatsappCallResponse>(
      `whatsapp_calls/${id}/accept`,
      { sdp_answer: sdpAnswer },
      inAccount(accountId),
    );
    return response.data;
  }

  static async rejectWhatsappCall(id: number, accountId?: number) {
    const response = await apiService.post<{ id: number; status: string }>(
      `whatsapp_calls/${id}/reject`,
      undefined,
      inAccount(accountId),
    );
    return response.data;
  }

  static async terminateWhatsappCall(id: number, accountId?: number) {
    const response = await apiService.post<{ id: number; status: string }>(
      `whatsapp_calls/${id}/terminate`,
      undefined,
      inAccount(accountId),
    );
    return response.data;
  }

  // Server-side dial of the contact into a Twilio conference; the agent leg joins separately
  static async startContactCall({
    contactId,
    inboxId,
    conversationId,
  }: {
    contactId: number;
    inboxId: number;
    conversationId?: number;
  }) {
    const response = await apiService.post<ContactCallResponse>(`contacts/${contactId}/call`, {
      inbox_id: inboxId,
      ...(conversationId ? { conversation_id: conversationId } : {}),
    });
    return response.data;
  }

  // A 422 here carries the permission-request outcome, which is a normal result rather
  // than an error, so it is accepted instead of going through the global error toast.
  static async initiateWhatsappCall({
    sdpOffer,
    conversationId,
    contactId,
    inboxId,
  }: WhatsappInitiateParams) {
    const response = await apiService.post<WhatsappInitiateResponse>(
      'whatsapp_calls/initiate',
      {
        sdp_offer: sdpOffer,
        ...(conversationId
          ? { conversation_id: conversationId }
          : { contact_id: contactId, inbox_id: inboxId }),
      },
      { validateStatus: status => (status >= 200 && status < 300) || status === 422 },
    );
    return response.data;
  }

  static async getConferenceToken(inboxId: number, accountId?: number) {
    const response = await apiService.get<ConferenceTokenResponse>(
      `inboxes/${inboxId}/conference/token`,
      inAccount(accountId),
    );
    return response.data;
  }

  static async joinConference({ inboxId, conversationId, callSid, accountId }: ConferenceParams) {
    const response = await apiService.post<ConferenceJoinResponse>(
      `inboxes/${inboxId}/conference`,
      { conversation_id: conversationId, call_sid: callSid },
      inAccount(accountId),
    );
    return response.data;
  }

  static async leaveConference({ inboxId, conversationId, callSid, accountId }: ConferenceParams) {
    const response = await apiService.delete<{ status: string; id: number }>(
      `inboxes/${inboxId}/conference`,
      inAccount(accountId, { params: { conversation_id: conversationId, call_sid: callSid } }),
    );
    return response.data;
  }
}
