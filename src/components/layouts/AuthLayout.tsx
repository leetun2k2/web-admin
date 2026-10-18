import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface AuthLayoutProps {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-8 p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:p-12">
      {/* Brand feature summary on large screens */}
      <div className="hidden max-w-md space-y-6 lg:block">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground shadow-sm">
            A
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Anlew</h1>
            <p className="text-xs text-muted-foreground">
              {t('auth.layout.portalTitle')}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {t('auth.layout.administration')}
          </h2>

          <ul className="space-y-2.5 text-sm text-foreground">
            <li className="flex items-center gap-2">
              <span className="flex size-4 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check className="size-2.5" aria-hidden="true" />
              </span>
              <span>{t('auth.layout.features.rbac')}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex size-4 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check className="size-2.5" aria-hidden="true" />
              </span>
              <span>{t('auth.layout.features.monitoring')}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex size-4 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check className="size-2.5" aria-hidden="true" />
              </span>
              <span>{t('auth.layout.features.fastOps')}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Main auth card */}
      <div className="w-full max-w-md space-y-6">
        {/* Mobile brand badge */}
        <div className="flex flex-col items-center gap-2 text-center lg:hidden">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground shadow-sm">
            A
          </div>
          <h2 className="text-xl font-semibold text-foreground">Anlew</h2>
          <p className="text-xs text-muted-foreground">
            {t('auth.layout.portalTitle')}
          </p>
        </div>

        <Card className="border-border shadow-sm">
          {(title || subtitle) && (
            <CardHeader className="text-center">
              {title && <CardTitle className="text-xl">{title}</CardTitle>}
              {subtitle && (
                <CardDescription className="text-sm">
                  {subtitle}
                </CardDescription>
              )}
            </CardHeader>
          )}
          <CardContent>{children ?? <Outlet />}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthLayout;
