import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAdminRelation,
  fetchAdminClients,
  fetchAdminTrainers,
  updateAdminRelation,
} from '../api/adminRelationsService';

export const adminRelationsQueryKeys = {
  trainers: ['admin', 'relations', 'trainers'] as const,
  clients: ['admin', 'relations', 'clients'] as const,
};

export const useAdminTrainers = () =>
  useQuery({ queryKey: adminRelationsQueryKeys.trainers, queryFn: fetchAdminTrainers });

export const useAdminClients = () =>
  useQuery({ queryKey: adminRelationsQueryKeys.clients, queryFn: fetchAdminClients });

type SaveRelationVariables = {
  clientId: string;
  trainerId: string | null;
  action: 'create' | 'update';
};

export const useSaveRelation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clientId, trainerId, action }: SaveRelationVariables) => {
      if (action === 'create') {
        return createAdminRelation({ clientId, trainerId });
      }
      return updateAdminRelation(clientId, { trainerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminRelationsQueryKeys.clients });
      queryClient.invalidateQueries({ queryKey: adminRelationsQueryKeys.trainers });
    },
  });
};
