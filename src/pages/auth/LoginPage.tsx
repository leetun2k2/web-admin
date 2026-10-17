import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { authService } from '@/services';

export const LoginPage = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get('error');

  const getTranslatedErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'access_denied':
        return t('auth.login.errors.access_denied');
      case 'expired_request':
        return t('auth.login.errors.expired_request');
      case 'invalid_request':
        return t('auth.login.errors.invalid_request');
      case 'temporarily_unavailable':
        return t('auth.login.errors.temporarily_unavailable');
      case 'csrf_failed':
        return t('auth.login.errors.csrf_failed');
      default:
        return t('auth.login.errors.default');
    }
  };

  const activeError = errorParam
    ? getTranslatedErrorMessage(errorParam)
    : localError;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setLocalError(null);
    try {
      await authService.loginWithGoogle();
    } catch {
      setLocalError(t('auth.login.errors.temporarily_unavailable'));
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {t('auth.login.title')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('auth.login.subtitle')}
        </p>
      </header>

      {activeError && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="size-4" aria-hidden="true" />
          <AlertTitle className="sr-only">
            {t('auth.login.errorTitle')}
          </AlertTitle>
          <AlertDescription>{activeError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          aria-label={t('auth.login.googleAriaLabel')}
          className="h-11 w-full gap-3 font-medium transition-colors"
        >
          {isLoading ? (
            <>
              <Spinner
                className="size-4"
                aria-label={t('common.status.loading')}
              />
              <span>{t('auth.login.processing')}</span>
            </>
          ) : (
            <>
              <svg
                className="size-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>{t('auth.login.continueWithGoogle')}</span>
            </>
          )}
        </Button>
      </div>

      <Separator />
    </div>
  );
};

export default LoginPage;
