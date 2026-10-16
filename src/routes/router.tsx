import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { EditorPage } from '@/pages/EditorPage';
import { ProjectPage } from '@/pages/ProjectPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ForgotPassword } from '@/pages/auth/ForgotPassword/ForgotPassword';
import { Login } from '@/pages/auth/Login/Login';
import { Register } from '@/pages/auth/Register/Register';
import { Profile } from '@/pages/profile/Profile/Profile';
import { PrivateRoutes } from './PrivateRoutes';
import { PublicRoutes } from './PublicRoutes';

export const router = createBrowserRouter([
  {
    element: <PublicRoutes />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
    ],
  },
  {
    element: <PrivateRoutes />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/projects', element: <ProjectsPage /> },
          { path: '/projects/:projectId', element: <ProjectPage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/profile', element: <Profile /> },
        ],
      },
      { path: '/projects/:projectId/diagrams/:diagramId', element: <EditorPage /> },
    ],
  },
  {
    path: '*',
    element: (
      <div className="page">
        <div className="empty">Página não encontrada.</div>
      </div>
    ),
  },
]);
