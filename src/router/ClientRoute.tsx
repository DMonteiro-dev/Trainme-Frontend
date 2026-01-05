import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export type ClientRouteProps = {
  children: ReactNode;
};

const ClientRoute = ({ children }: ClientRouteProps) => {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>A validar o teu perfil...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'client') {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};

export default ClientRoute;
