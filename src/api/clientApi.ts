import apiClient from '../lib/api';
import type { ClientProfile, TrainingSession, ProgressLog } from '../types';
import { unwrapResponse } from '../lib/api';

export const fetchClientProfile = async () => {
  const response = await apiClient.get<ClientProfile>('/api/clients/me');
  return unwrapResponse<ClientProfile>(response.data);
};

export const fetchClientSessions = async (params?: Record<string, string | number | boolean | undefined>) => {
  const response = await apiClient.get<TrainingSession[]>('/api/sessions', {
    params: {
      clientId: 'me',
      ...params,
    },
  });
  return unwrapResponse<TrainingSession[]>(response.data);
};

export const fetchClientProgressLogs = async (params?: Record<string, string | number | boolean | undefined>) => {
  const response = await apiClient.get<ProgressLog[]>('/api/progress', {
    params: {
      clientId: 'me',
      ...params,
    },
  });
  return unwrapResponse<ProgressLog[]>(response.data);
};

export const fetchLatestProgressLog = async () => {
  const logs = await fetchClientProgressLogs({ limit: 1, sort: 'desc' });
  return logs[0] || null;
};

export const fetchUpcomingSessions = async () => {
  return fetchClientSessions({ status: 'confirmed', futureOnly: true, limit: 5 });
};

export type CreateProgressPayload = {
  date: string;
  weight: number;
  bodyFatPercent?: number;
  measurements?: Record<string, number>;
  notes?: string;
};

export const createProgressLog = async (payload: CreateProgressPayload) => {
  const response = await apiClient.post<ProgressLog>('/api/progress-logs', payload);
  return unwrapResponse<ProgressLog>(response.data);
};
