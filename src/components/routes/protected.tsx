import type { RouteObject } from 'react-router-dom';
import { ProtectedLayout } from '../layouts/ProtectedLayout';
import { RequireAuth } from './RequireAuth';
import { AdminGuard } from './AdminGuard';
import { HomePage } from '../../pages/public/HomePage';
import { NotFoundPage } from '../../pages/public/NotFoundPage';
import { SettingsPage } from '../../pages/public/SettingsPage';
import { ProfilePage } from '../../pages/public/ProfilePage';
import {
  UsersPage,
  IdentitiesPage,
  RolesPage,
  SessionsPage,
  ClientsPage,
} from '../../pages/iam';

export const protectedRoutes: RouteObject[] = [
  {
    path: '/a',
    element: (
      <RequireAuth>
        <ProtectedLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        element: <AdminGuard />,
        children: [
          {
            path: 'auth/users',
            element: <UsersPage />,
          },
          {
            path: 'auth/identities',
            element: <IdentitiesPage />,
          },
          {
            path: 'auth/roles',
            element: <RolesPage />,
          },
          {
            path: 'auth/sessions',
            element: <SessionsPage />,
          },
          {
            path: 'auth/clients',
            element: <ClientsPage />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

export default protectedRoutes;
