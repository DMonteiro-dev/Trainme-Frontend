import apiClient from '../lib/api';
import { unwrapResponse } from '../lib/api';

export const generateMagicLink = async () => {
    const response = await apiClient.post<{ token: string }>('/api/auth/magic-link');
    return unwrapResponse(response.data);
};

export const loginWithMagicLink = async (token: string) => {
    const response = await apiClient.post('/api/auth/magic-login', { token });
    return unwrapResponse(response.data);
};

export const forgotPassword = async (email: string) => {
    const response = await apiClient.post<{ message: string }>('/api/auth/forgot-password', { email });
    return unwrapResponse(response.data);
};

export const resetPassword = async (token: string, newPassword: string) => {
    const response = await apiClient.post<{ message: string }>('/api/auth/reset-password', { token, newPassword });
    return unwrapResponse(response.data);
};
