import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchClientProfile,
  fetchClientSessions,
  fetchClientProgressLogs,
  fetchLatestProgressLog,
  fetchUpcomingSessions,
  createProgressLog,
  type CreateProgressPayload,
} from '../api/clientApi';
import { trainingPlansApi } from '../api/trainingPlansApi';

export const clientQueryKeys = {
  profile: ['client', 'profile'] as const,
  trainingPlan: ['client', 'training-plan'] as const,
  workoutsWeek: (week: number) => ['client', 'training-plan', 'week', week] as const,
  sessions: ['client', 'sessions'] as const,
  upcomingSessions: ['client', 'sessions', 'upcoming'] as const,
  latestProgress: ['client', 'progress', 'latest'] as const,
  progressLogs: ['client', 'progress', 'logs'] as const,
};

export const useClientProfile = () =>
  useQuery({
    queryKey: clientQueryKeys.profile,
    queryFn: fetchClientProfile,
    staleTime: 1000 * 60 * 5,
  });

export const useClientTrainingPlan = () =>
  useQuery({
    queryKey: clientQueryKeys.trainingPlan,
    queryFn: async () => {
      const plans = await trainingPlansApi.list();
      return plans.find(p => p.status === 'active');
    },
  });

export const useClientTrainingPlanSummary = () =>
  useQuery({
    queryKey: [...clientQueryKeys.trainingPlan, 'summary'],
    queryFn: async () => {
      const plans = await trainingPlansApi.list();
      return plans.find(p => p.status === 'active');
    },
  });

export const useClientWorkoutsForWeek = (week: number | null) =>
  useQuery({
    queryKey: week ? clientQueryKeys.workoutsWeek(week) : ['client', 'training-plan', 'week'],
    queryFn: async () => {
      // Logic to get workouts for specific week could be complex with the new structure
      // For now, return empty or implement basic logic if needed
      return [];
    },
    enabled: Boolean(week),
  });

export const useClientSessions = () =>
  useQuery({
    queryKey: clientQueryKeys.sessions,
    queryFn: () => fetchClientSessions(),
  });

export const useUpcomingSessions = () =>
  useQuery({
    queryKey: clientQueryKeys.upcomingSessions,
    queryFn: fetchUpcomingSessions,
  });

export const useLatestProgressLog = () =>
  useQuery({
    queryKey: clientQueryKeys.latestProgress,
    queryFn: fetchLatestProgressLog,
  });

export const useProgressLogs = () =>
  useQuery({
    queryKey: clientQueryKeys.progressLogs,
    queryFn: () => fetchClientProgressLogs({ limit: 50, sort: 'desc' }),
  });

export const useCreateProgressLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProgressPayload) => createProgressLog(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.progressLogs });
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.latestProgress });
    },
  });
};

// Removed deprecated hooks toggleExerciseCompletion and submitWorkoutFeedback for now
// as they don't exist in trainingPlansApi yet and need backend support if needed.
