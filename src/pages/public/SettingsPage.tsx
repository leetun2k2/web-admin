import { useEffect, useState } from 'react';
import { Globe, Lock, ShieldCheck, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { authService, type UserProfile } from '@/services';

export const SettingsPage = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    let active = true;
    void authService
      .getCurrentUser()
      .then((profile) => {
        if (active) {
          setUser(profile);
        }
      })
      .catch(() => {
        // Handled by route guard
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-16">
      <section className="mb-10">
        <Badge variant="secondary" className="mb-3 text-xs font-medium">
          {t('settings.badge')}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t('settings.title')}
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          {t('settings.subtitle')}
        </p>
      </section>

      <div className="grid gap-6">
        {/* Account Settings Card */}
        <Card className="border-border shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="size-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-base">
                  {t('settings.account.title')}
                </CardTitle>
                <CardDescription>
                  {t('settings.account.description')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
            <div>
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {t('home.userCard.displayName')}
              </span>
              <p className="mt-1 text-sm font-medium text-foreground">
                {user?.display_name || t('home.userCard.notProvided')}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {t('home.userCard.email')}
              </span>
              <p className="mt-1 text-sm font-medium text-foreground">
                {user?.email || t('home.userCard.notProvided')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* General Preferences Card */}
        <Card className="border-border shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Globe className="size-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-base">
                  {t('settings.general.title')}
                </CardTitle>
                <CardDescription>
                  {t('settings.general.description')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="border-t border-border pt-6">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium text-foreground">Language</span>
                <p className="text-xs text-muted-foreground">English (US)</p>
              </div>
              <Badge variant="outline">Default</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Security & Sessions Card */}
        <Card className="border-border shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Lock className="size-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-base">
                  {t('settings.security.title')}
                </CardTitle>
                <CardDescription>
                  {t('settings.security.description')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="border-t border-border pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              <span>
                Session protected with HttpOnly cookies and CSRF validation.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
