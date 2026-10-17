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
          <CardTitle className="text-xl">Page Not Found</CardTitle>
          <CardDescription className="text-xs">
            The requested page does not exist.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/" className={buttonVariants({ className: 'gap-2' })}>
              <ArrowLeft className="size-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/auth/login"
              className={buttonVariants({
                variant: 'outline',
                className: 'gap-2',
              })}
            >
              <LogIn className="size-4" />
              <span>Sign In</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;
