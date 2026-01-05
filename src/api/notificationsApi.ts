import apiClient from '../lib/api';
import { unwrapResponse } from '../lib/api';

export interface INotification {
    _id: string;
    type: 'message' | 'session_scheduled' | 'system';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    metadata?: any;
}

export interface INotificationResponse {
    notifications: INotification[];
    unreadCount: number;
}

export const fetchNotifications = async (): Promise<INotificationResponse> => {
    const response = await apiClient.get<INotificationResponse>('/api/notifications');
    return unwrapResponse(response.data);
};

export const markAsRead = async (id: string) => {
    const response = await apiClient.patch(`/api/notifications/${id}/read`);
    return unwrapResponse(response.data);
};

export const markAllAsRead = async () => {
    const response = await apiClient.patch('/api/notifications/read-all');
    return unwrapResponse(response.data);
};
