import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Fingerprint,
  KeyRound,
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  User,
  UserCheck,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { iamService } from '@/services';

interface NavItem {
  title: string;
  url: string;
  icon: typeof Users;
  isActive: boolean;
}

export function AppSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const { open, setOpen, isMobile, setOpenMobile } = useSidebar();

  const handleItemClick = (e: React.MouseEvent, item: NavItem) => {
    if (isMobile) {
      setOpenMobile(false);
      return;
    }
    if (!open) {
      setOpen(true);
    } else if (item.isActive) {
      e.preventDefault();
      setOpen(false);
    }
  };

  const handleBrandClick = (e: React.MouseEvent) => {
    if (isMobile) {
      setOpenMobile(false);
      return;
    }
    if (!open) {
      e.preventDefault();
      setOpen(true);
    } else if (location.pathname === '/app' || location.pathname === '/app/') {
      e.preventDefault();
      setOpen(false);
    }
  };

  useEffect(() => {
    let active = true;
    iamService
      .getUserAccess()
      .then((access) => {
        if (active) setIsAdmin(access.is_admin);
      })
      .catch(() => {
        if (active) setIsAdmin(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const overviewItem: NavItem = {
    title: t('sidebar.items.overview'),
    url: '/app',
    icon: LayoutDashboard,
    isActive: location.pathname === '/app' || location.pathname === '/app/',
  };

  const catalogItems: NavItem[] = [
    {
      title: t('sidebar.items.products'),
      url: '/app/products',
      icon: Package,
      isActive: location.pathname.startsWith('/app/products'),
    },
  ];

  const authItems: NavItem[] = [
    {
      title: t('sidebar.items.users'),
      url: '/app/auth/users',
      icon: Users,
      isActive: location.pathname === '/app/auth/users',
    },
    {
      title: t('sidebar.items.identities'),
      url: '/app/auth/identities',
      icon: UserCheck,
      isActive: location.pathname === '/app/auth/identities',
    },
    {
      title: t('sidebar.items.roles'),
      url: '/app/auth/roles',
      icon: ShieldCheck,
      isActive: location.pathname === '/app/auth/roles',
    },
    {
      title: t('sidebar.items.sessions'),
      url: '/app/auth/sessions',
      icon: KeyRound,
      isActive: location.pathname === '/app/auth/sessions',
    },
    {
      title: t('sidebar.items.registrations'),
      url: '/app/auth/clients',
      icon: Fingerprint,
      isActive: location.pathname === '/app/auth/clients',
    },
  ];

  const systemItems: NavItem[] = [
    {
      title: t('sidebar.items.profile'),
      url: '/app/profile',
      icon: User,
      isActive: location.pathname.startsWith('/app/profile'),
    },
    {
      title: t('sidebar.items.settings'),
      url: '/app/settings',
      icon: Settings,
      isActive: location.pathname.startsWith('/app/settings'),
    },
  ];

  return (
    <Sidebar collapsible="icon">
      {/* Sidebar Header with brand badge */}
      <SidebarHeader className="flex h-14 shrink-0 flex-row items-center border-b border-border px-2 py-0 gap-0">
        <div className="flex w-full items-center group-data-[collapsible=icon]:justify-center">
          <Link
            to="/app"
            onClick={handleBrandClick}
            className="flex h-8 min-w-0 items-center gap-2.5 rounded-lg px-2 py-0 transition-opacity hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
            title={t('sidebar.brandTitle')}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground shadow-xs">
              A
            </div>
            <div className="flex flex-col overflow-hidden leading-none group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-bold tracking-tight text-sidebar-foreground">
                {t('sidebar.brandTitle')}
              </span>
              <span className="truncate text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {t('sidebar.brandSubtitle')}
              </span>
            </div>
          </Link>
        </div>
      </SidebarHeader>

      {/* Navigation Menu */}
      <SidebarContent className="select-none p-2">
        <SidebarMenu className="gap-1">
          {/* Section 1: Overview */}
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link to={overviewItem.url} />}
              onClick={(e) => handleItemClick(e, overviewItem)}
              tooltip={overviewItem.title}
              isActive={overviewItem.isActive}
            >
              <overviewItem.icon />
              <span className="truncate group-data-[collapsible=icon]:hidden">
                {overviewItem.title}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Section 2: Authentication / IAM (admin only) */}
          {isAdmin && (
            <>
              <li
                className="pointer-events-none my-1 flex h-6 list-none select-none items-center"
                aria-hidden="true"
              >
                <span className="px-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase group-data-[collapsible=icon]:hidden">
                  {t('sidebar.nav.auth')}
                </span>
                <span className="hidden w-full items-center justify-center group-data-[collapsible=icon]:flex">
                  <span className="h-px w-5 bg-border/60" />
                </span>
              </li>
              {authItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    render={<Link to={item.url} />}
                    onClick={(e) => handleItemClick(e, item)}
                    tooltip={item.title}
                    isActive={item.isActive}
                  >
                    <item.icon />
                    <span className="truncate group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </>
          )}

          {/* Section 2: Catalog (admin only) */}
          {isAdmin && (
            <>
              <li
                className="pointer-events-none my-1 flex h-6 list-none select-none items-center"
                aria-hidden="true"
              >
                <span className="px-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase group-data-[collapsible=icon]:hidden">
                  {t('sidebar.nav.catalog')}
                </span>
                <span className="hidden w-full items-center justify-center group-data-[collapsible=icon]:flex">
                  <span className="h-px w-5 bg-border/60" />
                </span>
              </li>
              {catalogItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    render={<Link to={item.url} />}
                    onClick={(e) => handleItemClick(e, item)}
                    tooltip={item.title}
                    isActive={item.isActive}
                  >
                    <item.icon />
                    <span className="truncate group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </>
          )}

          {/* Section 3: System */}
          <li
            className="pointer-events-none my-1 flex h-6 list-none select-none items-center"
            aria-hidden="true"
          >
            <span className="px-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase group-data-[collapsible=icon]:hidden">
              {t('sidebar.nav.system')}
            </span>
            <span className="hidden w-full items-center justify-center group-data-[collapsible=icon]:flex">
              <span className="h-px w-5 bg-border/60" />
            </span>
          </li>
          {systemItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                render={<Link to={item.url} />}
                onClick={(e) => handleItemClick(e, item)}
                tooltip={item.title}
                isActive={item.isActive}
              >
                <item.icon />
                <span className="truncate group-data-[collapsible=icon]:hidden">
                  {item.title}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Sidebar resize & toggle rail */}
      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
