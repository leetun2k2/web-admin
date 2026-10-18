import type { ReactNode } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Separator } from '@/components/ui/separator';
import { Header } from './Header';

const CURRENT_YEAR = new Date().getFullYear();

export interface PublicLayoutProps {
  children?: ReactNode;
}

export const PublicLayout = ({ children }: PublicLayoutProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Header />

      <main className="flex flex-1 flex-col">{children ?? <Outlet />}</main>

      <footer className="border-t border-border bg-muted/20 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-xs text-muted-foreground sm:flex-row">
          <div>© {CURRENT_YEAR} Anlew</div>
          <div className="flex items-center gap-4">
            <Link
              to="/auth/login"
              className="transition-colors hover:text-foreground"
            >
              {t('publicLayout.actions.signIn')}
            </Link>
            <Separator orientation="vertical" className="h-3" />
            <a
              href="#support"
              className="transition-colors hover:text-foreground"
            >
              {t('publicLayout.actions.support')}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
