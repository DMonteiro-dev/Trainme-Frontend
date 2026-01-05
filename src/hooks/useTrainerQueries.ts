import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAvailableTrainers,
  fetchTrainerClients,
  fetchTrainerProfile,
  fetchTrainerSessions,
  updateSessionStatus,
  updateTrainerProfile,
  createClient,
  fetchUnassignedClients,
  assignClient,
} from '../api/trainerApi';
import { trainingPlansApi, ITrainingPlan } from '../api/trainingPlansApi';

export const trainerQueryKeys = {
  profile: ['trainer', 'profile'] as const,
  plans: ['trainer', 'plans'] as const,
  plan: (id: string) => ['trainer', 'plans', id] as const,
  sessions: ['trainer', 'sessions'] as const,
  clients: ['trainer', 'clients'] as const,
  directory: ['trainer', 'directory'] as const,
};

export const useTrainerProfile = () =>
  useQuery({ queryKey: trainerQueryKeys.profile, queryFn: fetchTrainerProfile });

export const useTrainerPlans = (filters?: { clientId?: string; trainerId?: string }) =>
  useQuery({
    queryKey: [trainerQueryKeys.plans, filters],
    queryFn: () => trainingPlansApi.list(filters),
  });

export const useTrainerPlanDetail = (planId: string | null) =>
  useQuery({
    queryKey: planId ? trainerQueryKeys.plan(planId) : ['trainer', 'plans', 'detail'],
    queryFn: () => trainingPlansApi.getById(planId as string),
    enabled: Boolean(planId),
  });

export const useTrainerSessions = (params?: Record<string, string | number | boolean | undefined>) =>
  useQuery({
    queryKey: [trainerQueryKeys.sessions, params],
    queryFn: () => fetchTrainerSessions(params),
  });

export const useTrainerClients = () =>
  useQuery({ queryKey: trainerQueryKeys.clients, queryFn: fetchTrainerClients });

export const useAvailableTrainers = (enabled = true) =>
  useQuery({ queryKey: trainerQueryKeys.directory, queryFn: fetchAvailableTrainers, enabled });

export const useUpdateTrainerProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTrainerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainerQueryKeys.profile });
    },
  });
};

export const useCreateTrainingPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: trainingPlansApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainerQueryKeys.plans });
    },
  });
};

export const useUpdateTrainingPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ITrainingPlan> }) => trainingPlansApi.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: trainerQueryKeys.plans });
      queryClient.invalidateQueries({ queryKey: trainerQueryKeys.plan(variables.id) });
    },
  });
};

export const useDeleteTrainingPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => trainingPlansApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: trainerQueryKeys.plans });
      queryClient.invalidateQueries({ queryKey: trainerQueryKeys.plan(id) });
    },
  });
};

export const useUpdateSessionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateSessionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainerQueryKeys.sessions });
    },
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainerQueryKeys.clients });
      queryClient.invalidateQueries({ queryKey: trainerQueryKeys.directory }); // Maybe not needed
    },
  });
};

export const useUnassignedClients = () =>
  useQuery({ queryKey: ['trainer', 'unassigned'], queryFn: fetchUnassignedClients });

export const useAssignClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainerQueryKeys.clients });
      queryClient.invalidateQueries({ queryKey: ['trainer', 'unassigned'] });
    },
  });
};

