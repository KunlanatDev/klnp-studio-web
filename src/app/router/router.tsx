import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { routes } from './routes';
import { LoginPage } from '../../features/authentication/pages/login-page';
import { RegisterPage } from '../../features/authentication/pages/register-page';
import { WorkspaceDashboardPage } from '../../features/workspaces/pages/workspace-dashboard-page';
import { DashboardLayout } from '../layouts/dashboard-layout';
import { HomePage } from '../../features/dashboard/pages/home-page';
import { ProjectsPage } from '../../features/projects/pages/projects-page';
import { ProjectDetailPage } from '../../features/projects/pages/project-detail-page';
import { EditorPage } from '../../features/editor/pages/editor-page';
import { useAuthStore } from '../../features/auth/stores/auth-store';

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { session, initialized } = useAuthStore();

  if (!initialized) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    return <Navigate to={routes.login} replace />;
  }

  return children;
}

function PublicAuthRoute({ children }: { children: React.ReactElement }) {
  const { session, initialized } = useAuthStore();

  if (!initialized) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (session) {
    return <Navigate to={routes.workspaces} replace />;
  }

  return children;
}

export function AppRouter() {
  return (
    <Routes>
      <Route
        path={routes.login}
        element={
          <PublicAuthRoute>
            <LoginPage />
          </PublicAuthRoute>
        }
      />
      <Route
        path={routes.register}
        element={
          <PublicAuthRoute>
            <RegisterPage />
          </PublicAuthRoute>
        }
      />

      {/* Authenticated Workspace List */}
      <Route
        path={routes.workspaces}
        element={
          <ProtectedRoute>
            <WorkspaceDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Authenticated Workspace App Dashboard & Project Management */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path={routes.dashboard} element={<HomePage />} />
        <Route path={routes.projects} element={<ProjectsPage />} />
        <Route path={routes.projectDetail} element={<ProjectDetailPage />} />
      </Route>

      {/* Editor & Visual Canvas Route */}
      <Route
        path={routes.canvas}
        element={
          <ProtectedRoute>
            <EditorPage />
          </ProtectedRoute>
        }
      />

      {/* Root redirects to workspaces */}
      <Route
        path={routes.home}
        element={<Navigate to={routes.workspaces} replace />}
      />

      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}
