import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export type TrainerRouteProps = {
  children: ReactNode;
};

const TrainerRoute = ({ children }: TrainerRouteProps) => {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>A validar permissões...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'trainer') {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};

export default TrainerRoute;
