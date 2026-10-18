import type { RouteObject } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import { protectedRoutes } from './protected';
import { publicRoutes } from './public';

export const routes: RouteObject[] = [...protectedRoutes, ...publicRoutes];

export const router = createBrowserRouter(routes);
