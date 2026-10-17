import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/spinner';
import { authService } from '@/services';

export const AuthCallbackPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (hasProcessedRef.current) {
      return;
    }
    hasProcessedRef.current = true;

    const checkSession = async () => {
      try {
        await authService.getCurrentUser();
        navigate('/', { replace: true });
      } catch {
        navigate('/auth/login?error=invalid_request', { replace: true });
      }
    };

    void checkSession();
  }, [navigate]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-4 py-8 text-center"
    >
      <Spinner
        className="size-8 text-primary"
        aria-label={t('common.status.loading')}
      />
      <p className="text-sm text-muted-foreground">
        {t('auth.callback.verifying')}
      </p>
    </div>
  );
};

export default AuthCallbackPage;
