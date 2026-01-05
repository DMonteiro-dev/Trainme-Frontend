import { apiClient } from '../lib/api';
import { unwrapResponse } from '../lib/api';

export interface Session {
    _id: string;
    trainer: {
        _id: string;
        name: string;
        email: string;
        avatarUrl?: string;
    };
    client: {
        _id: string;
        name: string;
        email: string;
        avatarUrl?: string;
    };
    startTime: string;
    endTime: string;
    notes?: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
    evidenceImage?: string;
    failureReason?: string;
    feedback?: string;
}

export const sessionsApi = {
    create: async (data: { clientId: string; startTime: string; endTime: string; notes?: string }) => {
        const response = await apiClient.post<{ message: string; data: Session }>('/api/sessions', data);
        return unwrapResponse<Session>(response.data);
    },

    list: async (filters?: { startDate?: string; endDate?: string }) => {
        const response = await apiClient.get<{ message: string; data: Session[] }>('/api/sessions', { params: filters });
        return unwrapResponse<Session[]>(response.data);
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/api/sessions/${id}`);
        return response.data;
    },

    update: async (id: string, data: Partial<Session> | FormData) => {
        const response = await apiClient.patch<{ message: string; data: Session }>(`/api/sessions/${id}`, data);
        return unwrapResponse<Session>(response.data);
    },

    getStats: async (clientId?: string) => {
        const response = await apiClient.get<{ message: string; data: SessionStats }>('/api/sessions/stats', {
            params: { clientId }
        });
        return unwrapResponse<SessionStats>(response.data);
    }
};

export interface SessionStats {
    weekly: {
        _id: { year: number; week: number };
        total: number;
        completed: number;
        missed: number;
    }[];
    monthly: {
        _id: { year: number; month: number };
        total: number;
        completed: number;
        missed: number;
    }[];
}
