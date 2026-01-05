import apiClient from '../lib/api';
import { unwrapResponse } from '../lib/api';
import type { ConversationPreview, Message } from '../types';

export const fetchConversations = async () => {
  const response = await apiClient.get<ConversationPreview[]>('/api/messages/conversations');
  return unwrapResponse<ConversationPreview[]>(response.data);
};

export const fetchConversation = async (userId: string) => {
  const response = await apiClient.get<{ messages: Message[], canSendMessage: boolean }>(`/api/messages/conversations/${userId}`);
  return unwrapResponse<{ messages: Message[], canSendMessage: boolean }>(response.data);
};

export const sendMessage = async (payload: { receiverId: string; content: string }) => {
  const response = await apiClient.post<Message>('/api/messages', payload);
  return unwrapResponse<Message>(response.data);
};

export const markMessageRead = async (messageId: string) => {
  const response = await apiClient.patch<Message>(`/api/messages/${messageId}/read`, {});
  return unwrapResponse<Message>(response.data);
};

export const toggleMessageLike = async (messageId: string) => {
  const response = await apiClient.post<Message>(`/api/messages/${messageId}/like`, {});
  return unwrapResponse<Message>(response.data);
};
