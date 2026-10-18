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
        <div className="flex min-h-svh w-full bg-background text-foreground">
          <AppSidebar />
          <SidebarInset className="flex flex-1 flex-col">
            <Header showSidebarTrigger />
            <div className="flex flex-1 flex-col overflow-y-auto">
              {children ?? <Outlet />}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default ProtectedLayout;
