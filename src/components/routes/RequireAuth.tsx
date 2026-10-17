import type { ReactNode } from 'react';
import { cloneElement, isValidElement, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { authService, type UserProfile } from '@/services';

export interface RequireAuthProps {
  children?: ReactNode;
}

type AuthStatus = 'checking' | 'authenticated' | 'unauthorized' | 'error';

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [user, setUser] = useState<UserProfile | null>(null);

  const verifyAuth = () => {
    setStatus('checking');
    void authService
      .getCurrentUser()
      .then((profile) => {
        setUser(profile);
        setStatus('authenticated');
      })
      .catch((err: unknown) => {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setStatus('unauthorized');
          return;
        }
        setStatus('error');
      });
  };

  useEffect(() => {
    let active = true;

    authService
      .getCurrentUser()
      .then((profile) => {
        if (active) {
          setUser(profile);
          setStatus('authenticated');
        }
      })
      .catch((err: unknown) => {
        if (!active) {
          return;
        }
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setStatus('unauthorized');
          return;
        }
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, []);

  const handleRetry = () => {
    verifyAuth();
  };

  if (status === 'checking') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3 p-6 text-center"
      >
        <Spinner
          className="size-8 text-primary"
          aria-label={t('common.status.loading')}
        />
        <p className="text-sm font-medium text-muted-foreground">
          {t('guard.checking')}
        </p>
      </div>
    );
  }

  if (status === 'unauthorized') {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center p-6">
        <Card
          role="alert"
          className="w-full max-w-md border-destructive/30 shadow-sm"
        >
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl text-foreground">
              {t('guard.errorTitle')}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {t('guard.errorMessage')}
            </CardDescription>
          </CardHeader>
          <CardContent />
          <CardFooter className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleRetry}
              className="gap-2"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              <span>{t('guard.retry')}</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isValidElement<{ user?: UserProfile }>(children)) {
    return cloneElement(children, { user: user ?? undefined });
  }

  return children ? <>{children}</> : <Outlet context={{ user }} />;
};

export default RequireAuth;
