import apiClient from '../lib/api';
import { unwrapResponse } from '../lib/api';
import type { AdminUser, UserRole } from '../types';

export type AdminUserFilters = {
  role?: UserRole;
  search?: string;
  page?: number;
  limit?: number;
};

export type CreateAdminUserPayload = {
  name: string;
  email: string;
  password: string;
  role: 'trainer' | 'admin';
};

export const fetchAdminUsers = async (params?: AdminUserFilters) => {
  const response = await apiClient.get<AdminUser[]>('/api/admin/users', { params });
  return unwrapResponse<AdminUser[]>(response.data);
};

export const fetchAdminUser = async (id: string) => {
  const response = await apiClient.get<AdminUser>(`/api/admin/users/${id}`);
  return unwrapResponse<AdminUser>(response.data);
};

export const updateAdminUserStatus = async (id: string, status: 'active' | 'blocked' | 'pending') => {
  const response = await apiClient.patch<AdminUser>(`/api/admin/users/${id}/status`, { status });
  return unwrapResponse<AdminUser>(response.data);
};

export const createAdminUser = async (payload: CreateAdminUserPayload) => {
  const response = await apiClient.post<AdminUser>('/api/admin/users', payload);
  return unwrapResponse<AdminUser>(response.data);
};

export const updateAdminUserRole = async (id: string, role: UserRole) => {
  const response = await apiClient.patch<AdminUser>(`/api/admin/users/${id}/role`, { role });
  return unwrapResponse<AdminUser>(response.data);
};

export const updateAdminUser = async (id: string, payload: { name?: string; email?: string; role?: UserRole; status?: string }) => {
  const response = await apiClient.patch<AdminUser>(`/api/admin/users/${id}`, payload);
  return unwrapResponse<AdminUser>(response.data);
};
