import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createAdminUser, fetchAdminUser, fetchAdminUsers, updateAdminUserStatus, updateAdminUserRole } from '../api/adminApi';
import type { AdminUserFilters } from '../api/adminApi';

export const adminQueryKeys = {
  users: (params?: AdminUserFilters) => ['admin', 'users', params] as const,
  user: (id: string) => ['admin', 'user', id] as const,
};

export const useAdminUsers = (params?: AdminUserFilters) =>
  useQuery({ queryKey: adminQueryKeys.users(params), queryFn: () => fetchAdminUsers(params) });

export const useAdminUser = (id?: string) =>
  useQuery({ queryKey: adminQueryKeys.user(id ?? ''), queryFn: () => fetchAdminUser(id!), enabled: Boolean(id) });

export const useAdminUserStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'blocked' | 'pending' }) => updateAdminUserStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.user(variables.id) });
    },
  });
};

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useAdminUserRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'admin' | 'trainer' | 'client' }) => updateAdminUserRole(id, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.user(variables.id) });
    },
  });
};
