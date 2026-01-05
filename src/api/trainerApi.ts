import apiClient from '../lib/api';
import type { TrainerProfile, TrainingSession, ClientProfile } from '../types';
import { unwrapResponse } from '../lib/api';

export const fetchTrainerProfile = async () => {
  const response = await apiClient.get<TrainerProfile>('/api/trainers/me');
  return unwrapResponse<TrainerProfile>(response.data);
};

export const updateTrainerProfile = async (payload: Partial<TrainerProfile>) => {
  const response = await apiClient.put<TrainerProfile>('/api/trainers/me', payload);
  return unwrapResponse<TrainerProfile>(response.data);
};

export const fetchTrainerSessions = async (params?: Record<string, string | number | boolean | undefined>) => {
  const response = await apiClient.get<TrainingSession[]>('/api/sessions', {
    params: { trainerId: 'me', ...params },
  });
  return unwrapResponse<TrainingSession[]>(response.data);
};

export const updateSessionStatus = async (id: string, status: string) => {
  const response = await apiClient.patch<TrainingSession>(`/api/sessions/${id}/status`, { status });
  return unwrapResponse<TrainingSession>(response.data);
};

export const fetchTrainerClients = async () => {
  const response = await apiClient.get<ClientProfile[]>('/api/trainers/me/clients');
  return unwrapResponse<ClientProfile[]>(response.data);
};

export const fetchAvailableTrainers = async () => {
  const response = await apiClient.get<TrainerProfile[]>('/api/trainers');
  return unwrapResponse<TrainerProfile[]>(response.data);
};

export const createClient = async (payload: { name: string; email: string; password: string }) => {
  const response = await apiClient.post<any>('/api/trainers/clients', payload);
  return unwrapResponse<any>(response.data);
};

export const fetchUnassignedClients = async () => {
  const response = await apiClient.get<any[]>('/api/trainers/clients/unassigned');
  return unwrapResponse<any[]>(response.data);
};

export const assignClient = async (clientId: string) => {
  const response = await apiClient.post<any>(`/api/trainers/clients/${clientId}/assign`, {});
  return unwrapResponse<any>(response.data);
};
