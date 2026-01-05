import apiClient from '../lib/api';
import { unwrapResponse } from '../lib/api';
import type { TrainerChangeRequest, TrainerChangeRequestStatus } from '../types';

export const fetchAdminTrainerChangeRequests = async (params?: { status?: TrainerChangeRequestStatus }) => {
  const response = await apiClient.get<TrainerChangeRequest[]>('/api/admin/trainer-change-requests', { params });
  return unwrapResponse<TrainerChangeRequest[]>(response.data);
};

export const approveTrainerChangeRequest = async (id: string) => {
  const response = await apiClient.patch<TrainerChangeRequest>(`/api/admin/trainer-change-requests/${id}/approve`);
  return unwrapResponse<TrainerChangeRequest>(response.data);
};

export const rejectTrainerChangeRequest = async (id: string) => {
  const response = await apiClient.patch<TrainerChangeRequest>(`/api/admin/trainer-change-requests/${id}/reject`);
  return unwrapResponse<TrainerChangeRequest>(response.data);
};

export const createTrainerChangeRequest = async (payload: { requestedTrainerId?: string | null; reason: string }) => {
  const response = await apiClient.post<TrainerChangeRequest>('/api/trainer-change-requests', payload);
  return unwrapResponse<TrainerChangeRequest>(response.data);
};

export const fetchClientTrainerChangeRequests = async (): Promise<TrainerChangeRequest[]> => {
  const { data } = await apiClient.get<{ data: TrainerChangeRequest[] }>('/api/trainer-change-requests');
  return data.data;
};
