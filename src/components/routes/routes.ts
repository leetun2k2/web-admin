import type { RouteObject } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import { authRoutes } from './auth';
import { publicRoutes } from './public';

export const routes: RouteObject[] = [...authRoutes, ...publicRoutes];

export const router = createBrowserRouter(routes);
