import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchExercises, createExercise, updateExercise, deleteExercise, ExerciseFilters, ExerciseDefinition } from '../api/exercisesApi';

export const useExercises = (filters: ExerciseFilters = {}) => {
    return useQuery({
        queryKey: ['exercises', filters],
        queryFn: () => fetchExercises(filters),
    });
};

export const useCreateExercise = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createExercise,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
        },
    });
};

export const useUpdateExercise = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<ExerciseDefinition> }) => updateExercise(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
        },
    });
};

export const useDeleteExercise = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteExercise,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
        },
    });
};
