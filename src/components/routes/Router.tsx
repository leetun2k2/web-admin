import { useMemo } from 'react';
import type { RouteObject } from 'react-router-dom';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { router as defaultRouter } from './routes';

export interface RouterProps {
  customRoutes?: RouteObject[];
}

export const Router = ({ customRoutes }: RouterProps) => {
  const browserRouter = useMemo(() => {
    if (customRoutes) {
      return createBrowserRouter(customRoutes);
    }
    return defaultRouter;
  }, [customRoutes]);

  return <RouterProvider router={browserRouter} />;
};

export default Router;
