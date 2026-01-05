import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { theme } from '../design-system/theme';
import { fetchNotifications, INotification, markAsRead as apiMarkAsRead, markAllAsRead as apiMarkAllAsRead } from '../api/notificationsApi';

interface NotificationContextType {
    socket: Socket | null;
    showToast: (message: string) => void;
    notifications: INotification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { accessToken } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadNotifications = async () => {
        try {
            const data = await fetchNotifications();
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Failed to load notifications', error);
        }
    };

    useEffect(() => {
        if (!accessToken) return;

        loadNotifications();

        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', {
            auth: { token: accessToken },
            transports: ['websocket'],
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
        });

        // Handler helper to update local state immediately
        const handleNewNotification = (title: string, message: string, type: 'message' | 'session_scheduled' | 'system') => {
            showToast(`${title}: ${message}`);
            // We could optimistically add to list, or re-fetch.
            // Let's re-fetch to be safe and simple for now, or just increment count.
            // A verified implementation would construct a temp notification object.
            loadNotifications();
        };

        newSocket.on('receive_message', (data: any) => {
            handleNewNotification('Nova Mensagem', 'Recebeu uma nova mensagem', 'message');
        });

        newSocket.on('session_scheduled', (data: any) => {
            handleNewNotification('Nova Sessão', 'Uma nova sessão foi agendada', 'session_scheduled');
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [accessToken]);

    const showToast = (message: string) => {
        setToast({ message, visible: true });
        setTimeout(() => setToast(null), 3000);
    };

    const markAsRead = async (id: string) => {
        await apiMarkAsRead(id);
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = async () => {
        await apiMarkAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    return (
        <NotificationContext.Provider value={{ socket, showToast, notifications, unreadCount, markAsRead, markAllAsRead }}>
            {children}
            {toast && (
                <div style={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    background: theme.colors.surface,
                    border: `1px solid ${theme.colors.primary}`,
                    padding: theme.spacing.md,
                    borderRadius: theme.radii.md,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    zIndex: 9999,
                    animation: 'slideIn 0.3s ease-out',
                    color: theme.colors.text
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Notificação</div>
                    <div>{toast.message}</div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within a NotificationProvider');
    return context;
};
