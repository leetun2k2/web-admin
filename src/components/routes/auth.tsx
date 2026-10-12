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
  // Shortcut chuyển hướng nhanh từ đường dẫn cấp 1 sang /auth/login
  {
    path: '/login',
    element: <Navigate to="/auth/login" replace />,
  },
];

export default authRoutes;
