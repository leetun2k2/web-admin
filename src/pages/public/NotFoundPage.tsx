import { Link } from 'react-router-dom';
import { ArrowLeft, LogIn } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const NotFoundPage = () => {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md border-border text-center shadow-sm">
        <CardHeader className="space-y-2 pb-2">
          <div className="text-6xl font-extrabold tracking-tight text-primary">
            404
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            The page you are looking for does not exist, has been moved, or is
            temporarily unavailable.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/" className={buttonVariants({ className: 'gap-2' })}>
              <ArrowLeft className="size-4" />
              <span>Return to Home</span>
            </Link>
            <Link
              to="/auth/login"
              className={buttonVariants({
                variant: 'outline',
                className: 'gap-2',
              })}
            >
              <LogIn className="size-4" />
              <span>Admin Sign In</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;
