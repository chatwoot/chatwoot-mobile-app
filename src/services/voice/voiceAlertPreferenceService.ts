import { apiService } from '@/services/APIService';

type InboxMemberAgent = {
  id: number;
  name?: string;
  email?: string;
  voiceCallAlertsEnabled?: boolean;
  voice_call_alerts_enabled?: boolean;
};

type InboxMembersResponse = {
  payload: InboxMemberAgent[];
};

export class VoiceAlertPreferenceService {
  static async getInboxMembers(inboxId: number) {
    const response = await apiService.get<InboxMembersResponse>(`inbox_members/${inboxId}`);
    return response.data.payload;
  }

  static async updateOwnPreference({
    inboxId,
    userId,
    enabled,
  }: {
    inboxId: number;
    userId: number;
    enabled: boolean;
  }) {
    const response = await apiService.patch<InboxMembersResponse>('inbox_members', {
      inbox_id: inboxId,
      voice_call_alerts_enabled_by_user_id: {
        [userId]: enabled,
      },
    });
    return response.data.payload;
  }

  static getAgentVoiceAlertPreference(agent: InboxMemberAgent | undefined) {
    return agent?.voiceCallAlertsEnabled ?? agent?.voice_call_alerts_enabled ?? true;
  }
}
