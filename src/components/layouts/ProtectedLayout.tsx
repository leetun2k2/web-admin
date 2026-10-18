import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';

export interface ProtectedLayoutProps {
  children?: ReactNode;
}

export const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen>
        <div className="flex min-h-svh w-full max-w-full overflow-x-hidden bg-background text-foreground">
          <AppSidebar />
          <SidebarInset className="flex min-w-0 flex-1 flex-col">
            <Header hideBrand />
            <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
              {children ?? <Outlet />}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default ProtectedLayout;
