import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Gauge,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
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

export interface HomePageProps {
  user?: UserProfile;
}

export const HomePage = ({ user: propUser }: HomePageProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(propUser ?? null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  useEffect(() => {
    if (!propUser) {
      let active = true;
      void authService
        .getCurrentUser()
        .then((profile) => {
          if (active) {
            setUser(profile);
          }
        })
        .catch(() => {
          // Guard will handle unauthenticated states
        });
      return () => {
        active = false;
      };
    }
  }, [propUser]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      await authService.logout();
      navigate('/auth/login', { replace: true });
    } catch {
      setLogoutError(t('home.userCard.logoutError'));
      setIsLoggingOut(false);
    }
  };

  const initial = (
    user?.display_name?.[0] ||
    user?.email?.[0] ||
    'A'
  ).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-16">
      {/* Hero Section */}
      <section className="mb-12 flex flex-col items-center text-center">
        <Badge variant="secondary" className="mb-4 text-xs font-medium">
          {t('home.badge')}
        </Badge>

        <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t('home.title')}
        </h1>

        <p className="max-w-xl text-base text-muted-foreground">
          {t('home.subtitle')}
        </p>
      </section>

      {/* User Session Profile Card */}
      <section className="mb-12">
        {logoutError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="size-4" aria-hidden="true" />
            <AlertTitle>{t('home.userCard.logoutErrorTitle')}</AlertTitle>
            <AlertDescription className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <span>{logoutError}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {t('common.actions.retry')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name ?? t('home.userCard.avatarAlt')}
                    className="size-14 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                    {initial}
                  </div>
                )}
                <div>
                  <CardTitle className="text-xl">
                    {user?.display_name || t('home.userCard.title')}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {user?.email || t('home.userCard.description')}
                  </CardDescription>
                </div>
              </div>

              <Button
                type="button"
                variant="destructive"
                size="lg"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="h-11 gap-2 self-start font-medium sm:self-auto"
              >
                {isLoggingOut ? (
                  <>
                    <Spinner
                      className="size-4"
                      aria-label={t('common.status.loading')}
                    />
                    <span>{t('home.userCard.loggingOut')}</span>
                  </>
                ) : (
                  <>
                    <LogOut className="size-4" aria-hidden="true" />
                    <span>{t('home.userCard.logout')}</span>
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
            <div>
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {t('home.userCard.userId')}
              </span>
              <p className="mt-1 font-mono text-sm text-foreground">
                {user?.user_id ?? '—'}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {t('home.userCard.email')}
              </span>
              <p className="mt-1 text-sm text-foreground">
                {user?.email ?? t('home.userCard.notProvided')}
              </p>
            </div>

            {user?.identity_id && (
              <div className="sm:col-span-2">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {t('home.userCard.identityId')}
                </span>
                <p className="mt-1 font-mono text-sm text-foreground">
                  {user.identity_id}
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-muted/20 py-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <UserIcon className="size-3.5" aria-hidden="true" />
              <span>{t('home.userCard.description')}</span>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              {t('home.actions.docs')}
            </a>
          </CardFooter>
        </Card>
      </section>

      {/* Feature Grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border shadow-sm transition-shadow hover:shadow">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Gauge className="size-5" aria-hidden="true" />
            </div>
            <CardTitle className="text-base">
              {t('home.features.performance.title')}
            </CardTitle>
            <CardDescription>
              {t('home.features.performance.description')}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border shadow-sm transition-shadow hover:shadow">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </div>
            <CardTitle className="text-base">
              {t('home.features.security.title')}
            </CardTitle>
            <CardDescription>
              {t('home.features.security.description')}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border shadow-sm transition-shadow hover:shadow sm:col-span-2 lg:col-span-1">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LayoutDashboard className="size-5" aria-hidden="true" />
            </div>
            <CardTitle className="text-base">
              {t('home.features.controlPlane.title')}
            </CardTitle>
            <CardDescription>
              {t('home.features.controlPlane.description')}
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </div>
  );
};

export default HomePage;
