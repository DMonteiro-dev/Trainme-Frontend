import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { theme } from '../design-system/theme';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const NotificationsPage: React.FC = () => {
    const { notifications, markAsRead, markAllAsRead } = useNotification();
    const navigate = useNavigate();

    const handleClick = async (notification: any) => {
        if (!notification.read) {
            await markAsRead(notification._id);
        }
        if (notification.type === 'message' && notification.metadata?.senderId) {
            navigate(`/app/messages/${notification.metadata.senderId}`);
        } else if (notification.type === 'session_scheduled') {
            navigate('/app/sessions');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
                <h1 style={{ fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold }}>Notificações</h1>
                {notifications.some(n => !n.read) && (
                    <button
                        onClick={() => markAllAsRead()}
                        style={{
                            background: 'none',
                            border: `1px solid ${theme.colors.primary}`,
                            color: theme.colors.primary,
                            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                            borderRadius: theme.radii.md,
                            cursor: 'pointer'
                        }}
                    >
                        Marcar tudo como lido
                    </button>
                )}
            </div>

            <div style={{ background: theme.colors.surface, borderRadius: theme.radii.md, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {notifications.length === 0 ? (
                    <div style={{ padding: theme.spacing.xl, textAlign: 'center', color: theme.colors.textMuted }}>
                        Não tem notificações.
                    </div>
                ) : (
                    <div>
                        {notifications.map(notification => (
                            <div
                                key={notification._id}
                                onClick={() => handleClick(notification)}
                                style={{
                                    padding: theme.spacing.lg,
                                    borderBottom: `1px solid ${theme.colors.border}`,
                                    background: notification.read ? 'transparent' : `${theme.colors.primary}08`,
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    display: 'flex',
                                    gap: theme.spacing.md
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.xs }}>
                                        <h3 style={{ margin: 0, fontSize: theme.typography.sizes.md, fontWeight: notification.read ? 500 : 700 }}>{notification.title}</h3>
                                        <span style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted }}>
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: pt })}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, color: theme.colors.textMuted }}>{notification.message}</p>
                                </div>
                                {!notification.read && (
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: theme.colors.primary, alignSelf: 'center' }} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
