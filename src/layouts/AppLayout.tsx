import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { useAdminTrainerChangeRequests } from '../hooks/useTrainerChangeRequests';
import { Bell, LogOut, Menu, User, Calendar, MessageSquare, Dumbbell, Users, Moon, Sun, ChevronDown } from 'lucide-react';
import { Message } from '../types';
import { useNotification } from '../context/NotificationContext';
import { theme } from '../design-system/theme';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

const clientNav = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/plans', label: 'Planos' },
  { to: '/app/sessions', label: 'Sessões' },
  { to: '/app/progress', label: 'Progresso' },
  { to: '/app/messages', label: 'Mensagens' },
];

const trainerNav = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/trainer/clients', label: 'Clientes' },
  { to: '/app/plans', label: 'Planos' },
  { to: '/app/sessions', label: 'Sessões' },
  { to: '/app/messages', label: 'Mensagens' },
];

// ... imports

const adminNav = [
  { to: '/app/admin', label: 'Administração' },
  { to: '/app/messages', label: 'Mensagens' },
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { theme, currentColors, mode, toggleTheme } = useTheme();
  // We don't need socket here for notifications anymore, context handles it
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Use Context instead of local state
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  const notificationRef = useRef<HTMLDivElement>(null);

  const { data: pendingRequests } = useAdminTrainerChangeRequests({ status: 'pending' }, { enabled: user?.role === 'admin' });
  const pendingCount = pendingRequests?.length ?? 0;

  // ... nav arrays

  // Remove local socket effect for messages -> notifications
  // The global context handles fetching and socket events now.

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    // Navigate based on type/metadata
    if (notification.type === 'message' && notification.metadata?.senderId) {
      navigate(`/app/messages/${notification.metadata.senderId}`);
    } else if (notification.type === 'session_scheduled') {
      navigate('/app/sessions');
    }

    setIsNotificationsOpen(false);
  };

  const currentNav = user?.role === 'trainer' ? trainerNav : (user?.role === 'admin' ? adminNav : clientNav);

  let currentTitle = currentNav.find(item => item.to === location.pathname)?.label;
  if (!currentTitle) {
    if (location.pathname.startsWith('/app/admin')) currentTitle = 'Administração';
    else if (location.pathname.startsWith('/app/messages')) currentTitle = 'Mensagens';
    else currentTitle = 'Dashboard';
  }

  return (
    // Remove NotificationProvider here, it should wrap the whole App, or at least be higher up. 
    // Wait, looking at index.tsx usually providers are there. 
    // If user didn't put it there, we might need it. 
    // Let's assume for now we keep the layout structure but use the hook.
    <div style={{ display: 'flex', minHeight: '100vh', background: currentColors.surface }}>
      <aside style={{ width: '280px', background: currentColors.surface, borderRight: `1px solid ${currentColors.border}`, display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease' }}>
        <div style={{ padding: theme.spacing.xl, display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
          <div style={{
            width: 48,
            height: 48,
            background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
            borderRadius: theme.radii.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 16px -4px ${theme.colors.primary}66`
          }}>
            <Dumbbell size={24} color="white" />
          </div>
          <div>
            <span style={{ fontSize: 24, fontWeight: 800, color: currentColors.text, letterSpacing: '-0.02em', display: 'block' }}>TrainMe</span>
            <span style={{ fontSize: 12, color: currentColors.textMuted, fontWeight: 500 }}>Personal Training</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: `0 ${theme.spacing.lg}`, display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: currentColors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: theme.spacing.md, marginBottom: theme.spacing.xs }}>Menu</p>

          {/* Admin Nav Link removed - now handled by map loop with badge logic below */}

          {currentNav.map((item) => {
            let Icon = User;
            if (item.label === 'Dashboard') Icon = Menu;
            if (item.label === 'Planos') Icon = Calendar;
            if (item.label === 'Sessões') Icon = Dumbbell;
            if (item.label === 'Mensagens') Icon = MessageSquare;
            if (item.label === 'Clientes') Icon = Users;
            if (item.label === 'Progresso') Icon = Calendar;
            if (item.label === 'Administração') Icon = Users;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/app/dashboard' || item.to === '/app/admin'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                  padding: theme.spacing.md,
                  borderRadius: theme.radii.md,
                  color: isActive ? 'white' : currentColors.textMuted,
                  background: isActive ? theme.colors.primary : 'transparent',
                  textDecoration: 'none',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s',
                })}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {item.label === 'Administração' && pendingCount > 0 && (
                  <span style={{ marginLeft: 'auto', background: theme.colors.danger, color: 'white', fontSize: 10, padding: '2px 6px', borderRadius: 10 }}>{pendingCount}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div style={{ padding: theme.spacing.lg, borderTop: `1px solid ${currentColors.border}` }}>
          {/* User Profile Summary or decorative element could go here */}
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: currentColors.background, color: currentColors.text }}>
        <header
          style={{
            height: '80px',
            padding: `0 ${theme.spacing.xl}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: currentColors.surface,
            borderBottom: `1px solid ${currentColors.border}`,
            position: 'sticky',
            top: 0,
            zIndex: 40
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: theme.typography.sizes.xl, fontWeight: 700, color: currentColors.text }}>{currentTitle}</h1>
            <p style={{ margin: 0, fontSize: theme.typography.sizes.sm, color: currentColors.textMuted }}>Bem-vindo de volta, {user?.name.split(' ')[0]}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>

            {/* Notifications */}
            <div style={{ position: 'relative' }} ref={notificationRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: currentColors.text,
                  position: 'relative',
                  padding: theme.spacing.xs,
                }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: theme.colors.danger,
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    borderRadius: '50%',
                    width: 16,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${currentColors.surface}` // optional border
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: theme.spacing.xs,
                    width: '320px',
                    background: currentColors.surface,
                    border: `1px solid ${currentColors.border}`,
                    borderRadius: theme.radii.md,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 50,
                    maxHeight: '400px', // Limit height
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ padding: theme.spacing.sm, borderBottom: `1px solid ${currentColors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontWeight: theme.typography.weights.medium }}>Notificações</p>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        style={{ background: 'none', border: 'none', color: theme.colors.primary, cursor: 'pointer', fontSize: theme.typography.sizes.xs }}
                      >
                        Marcar tudo como lido
                      </button>
                    )}
                  </div>
                  <div style={{ overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: theme.spacing.md, textAlign: 'center', color: currentColors.textMuted }}>
                        Sem notificações.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif)}
                          style={{
                            padding: theme.spacing.sm,
                            borderBottom: `1px solid ${currentColors.border}`,
                            cursor: 'pointer',
                            background: notif.read ? 'transparent' : `${theme.colors.primary}10`,
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = currentColors.surfaceAlt}
                          onMouseLeave={(e) => e.currentTarget.style.background = notif.read ? 'transparent' : `${theme.colors.primary}10`}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, fontSize: theme.typography.sizes.sm }}>{notif.title}</span>
                            <span style={{ fontSize: 10, color: theme.colors.textMuted }}>
                              {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: pt })}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: theme.typography.sizes.xs, color: currentColors.textMuted }}>
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ... User Dropdown ... */}

            {/* User Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.sm,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: currentColors.text,
                  padding: theme.spacing.xs,
                  borderRadius: theme.radii.md,
                }}
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${import.meta.env.VITE_API_URL}${user.avatarUrl}`}
                    alt={user.name}
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: theme.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontWeight: theme.typography.weights.medium, fontSize: theme.typography.sizes.sm }}>{user?.name}</p>
                </div>
                <ChevronDown size={16} />
              </button>

              {isDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: theme.spacing.xs,
                    width: '200px',
                    background: currentColors.surface,
                    border: `1px solid ${currentColors.border}`,
                    borderRadius: theme.radii.md,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    zIndex: 50,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: theme.spacing.sm, borderBottom: `1px solid ${currentColors.border}` }}>
                    <p style={{ margin: 0, fontWeight: theme.typography.weights.medium, color: currentColors.text }}>{user?.name}</p>
                    <p style={{ margin: 0, fontSize: theme.typography.sizes.xs, color: currentColors.textMuted }}>{user?.email}</p>
                  </div>

                  <Link
                    to="/app/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing.sm,
                      padding: theme.spacing.sm,
                      color: currentColors.text,
                      textDecoration: 'none',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = currentColors.surfaceAlt}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <User size={16} />
                    Editar Perfil
                  </Link>

                  <button
                    onClick={toggleTheme}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing.sm,
                      padding: theme.spacing.sm,
                      color: currentColors.text,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: 'inherit',
                      fontFamily: 'inherit'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = currentColors.surfaceAlt}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    {mode === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                  </button>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing.sm,
                      padding: theme.spacing.sm,
                      color: theme.colors.danger,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: 'inherit',
                      fontFamily: 'inherit',
                      borderTop: `1px solid ${currentColors.border}`
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = currentColors.surfaceAlt}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main style={{ padding: theme.spacing.lg, flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
