import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export type RoleAwareRouteProps = {
  client?: ReactNode;
  trainer?: ReactNode;
  admin?: ReactNode;
  fallback?: ReactNode;
};

const RoleAwareRoute = ({ client, trainer, admin, fallback }: RoleAwareRouteProps) => {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>A carregar...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'client' && client) {
    return <>{client}</>;
  }

  if (user.role === 'trainer' && trainer) {
    return <>{trainer}</>;
  }

  if (user.role === 'admin' && admin) {
    return <>{admin}</>;
  }

  return fallback ?? <Navigate to="/app" replace />;
};

export default RoleAwareRoute;
