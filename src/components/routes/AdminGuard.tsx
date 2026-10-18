import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
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
import { iamService, type UserAccess } from '@/services';

type AccessStatus = 'checking' | 'allowed' | 'denied' | 'error';

export const AdminGuard = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<AccessStatus>('checking');
  const [access, setAccess] = useState<UserAccess | null>(null);

  useEffect(() => {
    let active = true;
    iamService
      .getUserAccess()
      .then((data) => {
        if (!active) return;
        setAccess(data);
        setStatus(data.is_admin ? 'allowed' : 'denied');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, []);

  if (status === 'checking') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3 p-6"
      >
        <Spinner
          className="size-8 text-primary"
          aria-label={t('common.status.loading')}
        />
      </div>
    );
  }

  if (status === 'denied' || status === 'error') {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center p-6">
        <Card
          role="alert"
          className="w-full max-w-md border-destructive/30 shadow-sm"
        >
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldAlert className="size-6" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl text-foreground">
              {t('iam.access.deniedTitle')}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {t('iam.access.deniedDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent />
          <CardFooter className="flex justify-center">
            <Button render={<Link to="/a/profile" />} size="lg">
              {t('iam.access.viewProfile')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return access ? <Outlet context={{ access }} /> : null;
};

export default AdminGuard;
