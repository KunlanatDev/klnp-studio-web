import { Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './routes';
import { DashboardLayout } from '../layouts/dashboard-layout';
import { HomePage } from '../../features/dashboard/pages/home-page';

export function AppRouter() {
  return (
    <Routes>
      <Route path={routes.home} element={<Navigate to="/dashboard" replace />} />

      <Route element={<DashboardLayout />}>
        <Route
          path={routes.dashboard}
          element={<HomePage />}
        />
      </Route>

      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}

