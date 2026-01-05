import apiClient from '../lib/api';
import { unwrapResponse } from '../lib/api';
import type { AdminClientSummary, AdminTrainerSummary } from '../types';

export const fetchAdminTrainers = async () => {
  const response = await apiClient.get<AdminTrainerSummary[]>('/api/admin/trainers');
  return unwrapResponse<AdminTrainerSummary[]>(response.data);
};

export const fetchAdminClients = async () => {
  const response = await apiClient.get<AdminClientSummary[]>('/api/admin/clients');
  return unwrapResponse<AdminClientSummary[]>(response.data);
};

export const createAdminRelation = async (payload: { clientId: string; trainerId: string | null }) => {
  const response = await apiClient.post<AdminClientSummary>('/api/admin/relations', payload);
  return unwrapResponse<AdminClientSummary>(response.data);
};

export const updateAdminRelation = async (clientId: string, payload: { trainerId: string | null }) => {
  const response = await apiClient.patch<AdminClientSummary>(`/api/admin/relations/${clientId}`, payload);
  return unwrapResponse<AdminClientSummary>(response.data);
};
