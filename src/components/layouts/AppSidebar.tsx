import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  Fingerprint,
  KeyRound,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  User,
  UserCheck,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from 'cn';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { iamService } from '@/services';

interface NavItem {
  title: string;
  url: string;
  icon: typeof Users;
  isActive: boolean;
}

interface SidebarNavGroupProps {
  title: string;
  items: NavItem[];
}

function SidebarNavGroup({ title, items }: SidebarNavGroupProps) {
  const [open, setOpen] = useState(true);

  return (
    <SidebarGroup>
      <SidebarGroupLabel
        render={<button type="button" />}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-2 hover:text-sidebar-foreground"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            'size-3.5 shrink-0 transition-transform duration-200',
            !open && '-rotate-90',
          )}
          aria-hidden="true"
        />
      </SidebarGroupLabel>
      {open && (
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={<Link to={item.url} />}
                  tooltip={item.title}
                  isActive={item.isActive}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

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

  const navGroups: SidebarNavGroupProps[] = [
    {
      title: t('sidebar.nav.application'),
      items: [
        {
          title: t('sidebar.items.overview'),
          url: '/a',
          icon: LayoutDashboard,
          isActive: location.pathname === '/a',
        },
      ],
    },
    ...(isAdmin
      ? [
          {
            title: t('sidebar.nav.auth'),
            items: [
              {
                title: t('sidebar.items.users'),
                url: '/a/auth/users',
                icon: Users,
                isActive: location.pathname === '/a/auth/users',
              },
              {
                title: t('sidebar.items.identities'),
                url: '/a/auth/identities',
                icon: UserCheck,
                isActive: location.pathname === '/a/auth/identities',
              },
              {
                title: t('sidebar.items.roles'),
                url: '/a/auth/roles',
                icon: ShieldCheck,
                isActive: location.pathname === '/a/auth/roles',
              },
              {
                title: t('sidebar.items.sessions'),
                url: '/a/auth/sessions',
                icon: KeyRound,
                isActive: location.pathname === '/a/auth/sessions',
              },
              {
                title: t('sidebar.items.registrations'),
                url: '/a/auth/clients',
                icon: Fingerprint,
                isActive: location.pathname === '/a/auth/clients',
              },
            ],
          },
        ]
      : []),
    {
      title: t('sidebar.nav.system'),
      items: [
        {
          title: t('sidebar.items.profile'),
          url: '/a/profile',
          icon: User,
          isActive: location.pathname.startsWith('/a/profile'),
        },
        {
          title: t('sidebar.items.settings'),
          url: '/a/settings',
          icon: Settings,
          isActive: location.pathname.startsWith('/a/settings'),
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon">
      {/* Sidebar Header with brand badge and the sidebar collapse toggle */}
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:flex-col-reverse group-data-[collapsible=icon]:gap-2">
          <Link
            to="/a"
            className="flex min-w-0 items-center gap-2.5 rounded-lg p-1 transition-opacity hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground shadow-xs">
              A
            </div>
            <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-bold tracking-tight text-sidebar-foreground">
                {t('sidebar.brandTitle')}
              </span>
              <span className="truncate text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {t('sidebar.brandSubtitle')}
              </span>
            </div>
          </Link>
          <SidebarTrigger className="shrink-0" />
        </div>
      </SidebarHeader>

      {/* Navigation Menu */}
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarNavGroup
            key={group.title}
            title={group.title}
            items={group.items}
          />
        ))}
      </SidebarContent>

      {/* Sidebar resize & toggle rail */}
      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
