import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { LoginPage } from '../../pages/auth/LoginPage';

export const authRoutes: RouteObject[] = [
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/auth/login" replace />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
    ],
  },
  // Quick redirect shortcut from top-level /login to /auth/login
  {
    path: '/login',
    element: <Navigate to="/auth/login" replace />,
  },
];

export default authRoutes;
