import { apiService } from '@/services/APIService';

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

type ConferenceParams = { inboxId: number; conversationId: number; callSid: string };

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

export class CallService {
  static async getWhatsappCall(id: number) {
    const response = await apiService.get<WhatsappCallResponse>(`whatsapp_calls/${id}`);
    return response.data;
  }

  static async acceptWhatsappCall(id: number, sdpAnswer: string) {
    const response = await apiService.post<WhatsappCallResponse>(`whatsapp_calls/${id}/accept`, {
      sdp_answer: sdpAnswer,
    });
    return response.data;
  }

  static async rejectWhatsappCall(id: number) {
    const response = await apiService.post<{ id: number; status: string }>(
      `whatsapp_calls/${id}/reject`,
    );
    return response.data;
  }

  static async terminateWhatsappCall(id: number) {
    const response = await apiService.post<{ id: number; status: string }>(
      `whatsapp_calls/${id}/terminate`,
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

  static async getConferenceToken(inboxId: number) {
    const response = await apiService.get<ConferenceTokenResponse>(
      `inboxes/${inboxId}/conference/token`,
    );
    return response.data;
  }

  static async joinConference({ inboxId, conversationId, callSid }: ConferenceParams) {
    const response = await apiService.post<ConferenceJoinResponse>(
      `inboxes/${inboxId}/conference`,
      { conversation_id: conversationId, call_sid: callSid },
    );
    return response.data;
  }

  static async leaveConference({ inboxId, conversationId, callSid }: ConferenceParams) {
    const response = await apiService.delete<{ status: string; id: number }>(
      `inboxes/${inboxId}/conference`,
      { params: { conversation_id: conversationId, call_sid: callSid } },
    );
    return response.data;
  }
}
