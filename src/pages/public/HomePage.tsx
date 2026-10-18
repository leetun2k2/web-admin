import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Fingerprint,
  KeyRound,
  LogOut,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import {
  authService,
  getApiErrorMessage,
  iamService,
  type UserAccess,
} from '@/services';

interface ConsoleCount {
  key: string;
  labelKey: string;
  icon: typeof Users;
  url: string;
  value: number | null;
}

export const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [access, setAccess] = useState<UserAccess | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [accessLoaded, setAccessLoaded] = useState(false);
  const [counts, setCounts] = useState<ConsoleCount[]>([
    {
      key: 'users',
      labelKey: 'home.counts.users',
      icon: Users,
      url: '/a/auth/users',
      value: null,
    },
    {
      key: 'identities',
      labelKey: 'home.counts.identities',
      icon: UserCheck,
      url: '/a/auth/identities',
      value: null,
    },
    {
      key: 'roles',
      labelKey: 'home.counts.roles',
      icon: ShieldCheck,
      url: '/a/auth/roles',
      value: null,
    },
    {
      key: 'sessions',
      labelKey: 'home.counts.sessions',
      icon: KeyRound,
      url: '/a/auth/sessions',
      value: null,
    },
    {
      key: 'clients',
      labelKey: 'home.counts.clients',
      icon: Fingerprint,
      url: '/a/auth/clients',
      value: null,
    },
  ]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    iamService
      .getUserAccess()
      .then((data) => {
        if (active) setAccess(data);
      })
      .catch((err: unknown) => {
        if (active) {
          setAccessError(getApiErrorMessage(err, t('iam.common.error')));
        }
      })
      .finally(() => {
        if (active) setAccessLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [t]);

  useEffect(() => {
    if (!accessLoaded || !access?.is_admin) {
      return;
    }
    let active = true;
    const countParams = { page: 1, page_size: 1 };
    Promise.all([
      iamService.getUsers(countParams),
      iamService.getIdentities(countParams),
      iamService.getRoles(countParams),
      iamService.getSessions(countParams),
      iamService.getClients(countParams),
    ]).then(([users, identities, roles, sessions, clients]) => {
      if (!active) return;
      const totals = [
        users.pagination?.total_items ?? null,
        identities.pagination?.total_items ?? null,
        roles.pagination?.total_items ?? null,
        sessions.pagination?.total_items ?? null,
        clients.pagination?.total_items ?? null,
      ];
      setCounts((prev) =>
        prev.map((item, index) => ({ ...item, value: totals[index] })),
      );
    });
    return () => {
      active = false;
    };
  }, [accessLoaded, access?.is_admin]);

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
    access?.display_name?.[0] ||
    access?.email?.[0] ||
    'A'
  ).toUpperCase();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="mb-10">
        <Badge variant="secondary" className="mb-3 text-xs font-medium">
          {t('home.badge')}
        </Badge>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t('home.title')}
        </h1>
        <p className="max-w-xl text-base text-muted-foreground">
          {t('home.subtitle')}
        </p>
      </section>

      {/* Current Session Card */}
      <section className="mb-10">
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

        {accessError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="size-4" aria-hidden="true" />
            <AlertTitle>{t('home.userCard.loadErrorTitle')}</AlertTitle>
            <AlertDescription>{accessError}</AlertDescription>
          </Alert>
        )}

        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {access?.avatar_url ? (
                  <img
                    src={access.avatar_url}
                    alt=""
                    className="size-14 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                    {initial}
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-xl">
                      {access?.display_name || t('home.userCard.title')}
                    </CardTitle>
                    {access && (
                      <Badge
                        variant={access.is_admin ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {access.is_admin
                          ? t('iam.access.adminUser')
                          : t('iam.access.standardUser')}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm">
                    {access?.email || t('home.userCard.description')}
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
                {access?.user_id ?? '—'}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {t('home.userCard.email')}
              </span>
              <p className="mt-1 text-sm text-foreground">
                {access?.email ?? t('home.userCard.notProvided')}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {t('home.userCard.roles')}
              </span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {access?.roles && access.roles.length > 0 ? (
                  access.roles.map((r) => (
                    <Badge key={r} variant="outline" className="text-xs">
                      {r}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {t('home.userCard.isAdmin')}
              </span>
              <p className="mt-1 text-sm text-foreground">
                {access
                  ? access.is_admin
                    ? t('common.status.yes')
                    : t('common.status.no')
                  : '—'}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Console Counts or Standard User Banner */}
      {accessLoaded && access && !access.is_admin ? (
        <section>
          <Alert className="border-border">
            <AlertTitle>{t('home.standardUser.title')}</AlertTitle>
            <AlertDescription className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <span>{t('home.standardUser.description')}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                render={<Link to="/a/profile" />}
              >
                {t('iam.access.viewProfile')}
              </Button>
            </AlertDescription>
          </Alert>
        </section>
      ) : (
        <section>
          <h2 className="mb-3 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            {t('home.counts.title')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {counts.map((item) => (
              <Link key={item.key} to={item.url}>
                <Card className="border-border shadow-sm transition-shadow hover:shadow">
                  <CardHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <item.icon className="size-5" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-base">
                      {t(item.labelKey)}
                    </CardTitle>
                    <CardDescription className="text-2xl font-bold text-foreground">
                      {item.value ?? t('common.status.loading')}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
