import type { ReactNode } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const CURRENT_YEAR = new Date().getFullYear();

export interface PublicLayoutProps {
  children?: ReactNode;
}

export const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground shadow-sm">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground">
                Anthony Lewis
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Web Admin
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Home
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Documentation
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/auth/login"
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children ?? <Outlet />}</main>

      <footer className="border-t border-border bg-muted/20 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-xs text-muted-foreground sm:flex-row">
          <div>
            © {CURRENT_YEAR} Anthony Lewis. Centralized management portal.
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/auth/login"
              className="transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Separator orientation="vertical" className="h-3" />
            <a
              href="#support"
              className="transition-colors hover:text-foreground"
            >
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
