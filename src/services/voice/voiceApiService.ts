import { apiService } from '@/services/APIService';

export type VoiceConferenceToken = {
  token: string;
  identity?: string;
  account_id?: number;
  inbox_id?: number;
  mobile_push_credential_sid?: string;
};

export type VoiceConferenceJoinResponse = {
  status: string;
  id: number;
  conference_sid: string;
  using_webrtc: boolean;
};

class VoiceApiService {
  async getToken(inboxId: number) {
    const response = await apiService.get<VoiceConferenceToken>(
      `inboxes/${inboxId}/conference/token`,
    );
    return response.data;
  }

  async joinConference({
    inboxId,
    conversationId,
    callSid,
  }: {
    inboxId: number;
    conversationId: number;
    callSid: string;
  }) {
    const response = await apiService.post<VoiceConferenceJoinResponse>(
      `inboxes/${inboxId}/conference`,
      {
        conversation_id: conversationId,
        call_sid: callSid,
      },
    );
    return response.data;
  }

  async leaveConference({
    inboxId,
    conversationId,
    callSid,
  }: {
    inboxId: number;
    conversationId: number;
    callSid: string;
  }) {
    const response = await apiService.delete<{ status: string; id: number }>(
      `inboxes/${inboxId}/conference`,
      {
        params: {
          conversation_id: conversationId,
          call_sid: callSid,
        },
      },
    );
    return response.data;
  }
}

export const voiceApiService = new VoiceApiService();
