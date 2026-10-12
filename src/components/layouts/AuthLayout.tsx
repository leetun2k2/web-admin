import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Check } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const CURRENT_YEAR = new Date().getFullYear();

export interface AuthLayoutProps {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-svh w-full bg-background text-foreground">
      {/* Brand sidebar on large screens */}
      <aside className="relative hidden flex-1 flex-col justify-between border-r border-border bg-muted/40 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground shadow-sm">
            A
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Anthony Lewis
            </h1>
            <p className="text-xs text-muted-foreground">
              Web Administration Portal
            </p>
          </div>
        </div>

        <div className="my-auto max-w-md space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Secure and Intuitive Administration
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A unified management console offering robust security, real-time
              monitoring, and exceptional administrative performance.
            </p>
          </div>

          <ul className="space-y-3 text-sm text-foreground">
            <li className="flex items-center gap-2.5">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check className="size-3" />
              </span>
              <span>Multi-layer security &amp; granular access control</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check className="size-3" />
              </span>
              <span>Real-time system health and analytics</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check className="size-3" />
              </span>
              <span>Streamlined workflow for administrators</span>
            </li>
          </ul>
        </div>

        <div className="text-xs text-muted-foreground">
          © {CURRENT_YEAR} Anthony Lewis. All rights reserved.
        </div>
      </aside>

      {/* Main form section */}
      <main className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile brand header */}
          <div className="flex flex-col items-center gap-2 text-center lg:hidden">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground shadow-sm">
              A
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Anthony Lewis
            </h2>
            <p className="text-xs text-muted-foreground">
              Web Administration Portal
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

          <p className="text-center text-xs text-muted-foreground">
            Need technical assistance? Contact system administration.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
