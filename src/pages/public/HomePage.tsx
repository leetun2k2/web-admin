import { Link } from 'react-router-dom';
import { ArrowRight, Gauge, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const HomePage = () => {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      {/* Hero Section */}
      <section className="mb-16 flex flex-col items-center text-center">
        <Badge variant="secondary" className="mb-5 px-3 py-1 text-xs">
          Enterprise Management System
        </Badge>

        <h1 className="mb-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Unified administration with{' '}
          <span className="text-primary">Anthony Lewis</span>
        </h1>

        <p className="mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          A centralized control plane built for high-scale web administration,
          granular access permissions, and continuous operations.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/auth/login"
            className={buttonVariants({ size: 'lg', className: 'gap-2' })}
          >
            <span>Go to Admin Console</span>
            <ArrowRight className="size-4" />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            Documentation
          </a>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border shadow-sm transition-shadow hover:shadow">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Gauge className="size-5" />
            </div>
            <CardTitle className="text-lg">High Performance</CardTitle>
            <CardDescription className="leading-relaxed">
              Engineered with Vite and React Router for near-instant navigation
              and low-latency data presentation.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border shadow-sm transition-shadow hover:shadow">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <CardTitle className="text-lg">Enterprise Security</CardTitle>
            <CardDescription className="leading-relaxed">
              Standardized security controls, isolated authentication workflows,
              and strict role-based access management.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border shadow-sm transition-shadow hover:shadow sm:col-span-2 lg:col-span-1">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LayoutDashboard className="size-5" />
            </div>
            <CardTitle className="text-lg">Modern Design System</CardTitle>
            <CardDescription className="leading-relaxed">
              Powered by Tailwind CSS and accessible shadcn primitives with full
              responsive support.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </div>
  );
};

export default HomePage;
