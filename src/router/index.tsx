import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AppLayout from '../layouts/AppLayout';
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import MagicLoginPage from '../pages/auth/MagicLoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import ClientDashboardPage from '../pages/dashboard/ClientDashboardPage';
import { MyPlanPage } from '../pages/client/MyPlanPage';
import { WorkoutDetailPage } from '../pages/client/WorkoutDetailPage';
import ProgressOverviewPage from '../pages/progress/ProgressOverviewPage';
import TrainerDashboardPage from '../pages/trainer/TrainerDashboardPage';
import TrainerClientsPage from '../pages/trainer/TrainerClientsPage';
import { TrainingPlansPage } from '../pages/trainer/TrainingPlansPage';
import { TrainingPlanEditorPage } from '../pages/trainer/TrainingPlanEditorPage';
import { TrainerSessionsPage } from '../pages/trainer/TrainerSessionsPage';
import { ClientSessionsPage } from '../pages/sessions/ClientSessionsPage';
import TrainerProfilePage from '../pages/trainer/TrainerProfilePage';
import UserProfilePage from '../pages/common/UserProfilePage';
import ConversationsPage from '../pages/messages/ConversationsPage';
import ConversationDetailPage from '../pages/messages/ConversationDetailPage';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const NotificationsPage = React.lazy(() => import('../pages/NotificationsPage'));
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminUserDetailsPage from '../pages/admin/AdminUserDetailsPage';
import AdminRelationsPage from '../pages/admin/AdminRelationsPage';
import AdminTrainerChangeRequestsPage from '../pages/admin/AdminTrainerChangeRequestsPage';
import ProtectedRoute from './ProtectedRoute';
import TrainerRoute from './TrainerRoute';
import RoleAwareRoute from './RoleAwareRoute';
import AdminRoute from './AdminRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'magic-login',
        element: <MagicLoginPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
    ],
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <RoleAwareRoute
            client={<ClientDashboardPage />}
            trainer={<TrainerDashboardPage />}
            admin={<AdminDashboardPage />}
          />
        ),
      },
      {
        path: 'progress',
        element: <ProgressOverviewPage />,
      },
      {
        path: 'trainer/clients',
        element: (
          <TrainerRoute>
            <TrainerClientsPage />
          </TrainerRoute>
        ),
      },
      {
        path: 'plans',
        element: (
          <RoleAwareRoute
            client={<MyPlanPage />}
            // client={<div>MyPlanPage Placeholder</div>}
            trainer={<TrainingPlansPage />}
            admin={<Navigate to="/app/admin" replace />}
          />
        ),
      },
      {
        path: 'plans/workout/:id',
        element: (
          <RoleAwareRoute
            client={<WorkoutDetailPage />}
            trainer={<Navigate to="/app/dashboard" replace />}
            admin={<Navigate to="/app/admin" replace />}
          />
        ),
      },
      {
        path: 'trainer/plans/:id',
        element: (
          <TrainerRoute>
            <TrainingPlanEditorPage />
            {/* <div>TrainingPlanEditorPage Placeholder</div> */}
          </TrainerRoute>
        ),
      },
      {
        path: 'profile',
        element: <UserProfilePage />,
      },
      {
        path: 'trainer/profile',
        element: (
          <TrainerRoute>
            <TrainerProfilePage />
          </TrainerRoute>
        ),
      },
      {
        path: 'sessions',
        element: (
          <RoleAwareRoute
            client={<ClientSessionsPage />}
            trainer={<TrainerSessionsPage />}
          />
        ),
      },
      {
        path: 'messages',
        element: <ConversationsPage />,
      },
      {
        path: 'messages/:id',
        element: <ConversationDetailPage />,
      },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <Outlet />
          </AdminRoute>
        ),
        children: [
          {
            index: true,
            element: <AdminDashboardPage />,
          },
          {
            path: 'users',
            element: <AdminUsersPage />,
          },
          {
            path: 'users/:id',
            element: <AdminUserDetailsPage />,
          },
          {
            path: 'relations',
            element: <AdminRelationsPage />,
          },
          {
            path: 'trainer-change-requests',
            element: <AdminTrainerChangeRequestsPage />,
          },
        ],
      },
    ],
  },
]);
