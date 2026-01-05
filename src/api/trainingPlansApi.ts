import apiClient from '../lib/api';

export interface IExercise {
    name: string;
    sets: number;
    reps: string;
    instructions?: string;
    videoLink?: string;
}

export interface IDailyPlan {
    dayOfWeek: number;
    label?: string;
    exercises: IExercise[];
}

export interface ITrainingPlan {
    _id: string;
    trainerId: string;
    clientId: string | { _id: string; name: string; email: string; avatarUrl?: string };
    name: string;
    frequency: 3 | 4 | 5;
    startDate: string;
    durationWeeks: number;
    schedule: IDailyPlan[];
    // Optional compatibility fields
    difficulty?: string;
    workouts?: any[];
    myProgress?: {
        completionRate: number;
    };
    progress?: any[]; // For trainer progress view
    status: 'active' | 'archived';
    createdAt: string;
    updatedAt: string;
}



export const trainingPlansApi = {
    create: async (data: Partial<ITrainingPlan>) => {
        const response = await apiClient.post<{ message: string; data: ITrainingPlan }>('/api/plans', data);
        return response.data.data;
    },

    list: async (params?: { clientId?: string; trainerId?: string }) => {
        const response = await apiClient.get<{ message: string; data: ITrainingPlan[] }>('/api/plans', { params });
        return response.data.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<{ message: string; data: ITrainingPlan }>(`/api/plans/${id}`);
        return response.data.data;
    },

    update: async (id: string, data: Partial<ITrainingPlan>) => {
        const response = await apiClient.put<{ message: string; data: ITrainingPlan }>(`/api/plans/${id}`, data);
        return response.data.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete<{ message: string; data: ITrainingPlan }>(`/api/plans/${id}`);
        return response.data.data;
    }
};

// TODO: Implement actual backend endpoint
export const fetchDashboardStats = async () => {
    // Mock response to unblock frontend
    return {
        scheduledWorkouts: [] as any[]
    };
};
