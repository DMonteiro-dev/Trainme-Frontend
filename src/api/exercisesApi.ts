import { apiClient } from '../lib/api';
import { unwrapResponse } from '../lib/api';

export interface ExerciseDefinition {
    _id: string;
    name: string;
    description?: string;
    muscleGroup: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'abs' | 'cardio' | 'full_body' | 'other';
    equipment: 'none' | 'dumbbell' | 'barbell' | 'machine' | 'cables' | 'kettlebell' | 'band' | 'other';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    videoUrl?: string;
    createdBy?: string;
    isSystem: boolean;
}

export interface ExerciseFilters {
    search?: string;
    muscleGroup?: string;
    equipment?: string;
    difficulty?: string;
}

export const fetchExercises = async (filters: ExerciseFilters = {}): Promise<ExerciseDefinition[]> => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.muscleGroup) params.append('muscleGroup', filters.muscleGroup);
    if (filters.equipment) params.append('equipment', filters.equipment);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);

    const response = await apiClient.get(`/api/exercises?${params.toString()}`);
    return unwrapResponse<ExerciseDefinition[]>(response.data);
};

export const createExercise = async (data: Omit<ExerciseDefinition, '_id' | 'createdBy' | 'isSystem'>): Promise<ExerciseDefinition> => {
    const response = await apiClient.post('/api/exercises', data);
    return unwrapResponse<ExerciseDefinition>(response.data);
};

export const updateExercise = async (id: string, data: Partial<ExerciseDefinition>): Promise<ExerciseDefinition> => {
    const response = await apiClient.put(`/api/exercises/${id}`, data);
    return unwrapResponse<ExerciseDefinition>(response.data);
};

export const deleteExercise = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/exercises/${id}`);
};
