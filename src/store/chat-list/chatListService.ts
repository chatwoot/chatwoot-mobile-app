import { apiService } from '@/services/APIService';
import type {
  ChatListAPIResponse,
  ChatListRowsAPIResponse,
  ChatListRequestParams,
} from './chatListTypes';

export class ChatListService {
  static async fetchChatList(params: ChatListRequestParams) {
    const response = await apiService.get<ChatListAPIResponse>('conomni/chat_list', { params });
    return response.data.payload;
  }

  static async fetchRows(ids: number[]) {
    const response = await apiService.post<ChatListRowsAPIResponse>('conomni/chat_list/rows', {
      ids,
    });
    return response.data.payload;
  }
}
