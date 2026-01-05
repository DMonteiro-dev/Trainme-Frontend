import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveTrainerChangeRequest,
  createTrainerChangeRequest,
  fetchAdminTrainerChangeRequests,
  fetchClientTrainerChangeRequests,
  rejectTrainerChangeRequest,
} from '../api/trainerChangeRequestsService';
import type { TrainerChangeRequestStatus } from '../types';
import { adminRelationsQueryKeys } from './useAdminRelations';

export const trainerChangeRequestKeys = {
  adminList: (params?: { status?: TrainerChangeRequestStatus }) => ['trainer-change-requests', 'admin', params] as const,
  clientList: ['trainer-change-requests', 'client'] as const,
};

export const useAdminTrainerChangeRequests = (
  params?: { status?: TrainerChangeRequestStatus },
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: trainerChangeRequestKeys.adminList(params),
    queryFn: () => fetchAdminTrainerChangeRequests(params),
    enabled: options?.enabled ?? true,
  });

export const useClientTrainerChangeRequests = () =>
  useQuery({ queryKey: trainerChangeRequestKeys.clientList, queryFn: fetchClientTrainerChangeRequests });

export const useApproveTrainerChangeRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveTrainerChangeRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: ({ queryKey }) => queryKey[0] === 'trainer-change-requests' });
      queryClient.invalidateQueries({ queryKey: adminRelationsQueryKeys.clients });
      queryClient.invalidateQueries({ queryKey: adminRelationsQueryKeys.trainers });
    },
  });
};

export const useRejectTrainerChangeRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectTrainerChangeRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: ({ queryKey }) => queryKey[0] === 'trainer-change-requests' });
    },
  });
};

export const useCreateTrainerChangeRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTrainerChangeRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: ({ queryKey }) => queryKey[0] === 'trainer-change-requests' });
    },
  });
};
