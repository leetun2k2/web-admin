import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { AuthCallbackPage } from '../../pages/auth/AuthCallbackPage';
import { LoginPage } from '../../pages/auth/LoginPage';
import { NotFoundPage } from '../../pages/public/NotFoundPage';

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/a" replace />,
      },
      {
        path: 'auth',
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
          {
            path: 'callback',
            element: <AuthCallbackPage />,
          },
        ],
      },
      {
        path: 'login',
        element: <Navigate to="/auth/login" replace />,
      },
      {
        path: 'profile',
        element: <Navigate to="/a/profile" replace />,
      },
      {
        path: 'settings',
        element: <Navigate to="/a/settings" replace />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

export default publicRoutes;
