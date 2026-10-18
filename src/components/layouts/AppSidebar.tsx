import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { iamService } from '@/services';

const CURRENT_YEAR = new Date().getFullYear();

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

  const navGroups = [
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
      {/* Sidebar Header with brand badge */}
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <Link
          to="/a"
          className="flex items-center gap-2.5 rounded-lg p-1 transition-opacity hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring"
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
      </SidebarHeader>

      {/* Navigation Menu */}
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
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
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-3 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground group-data-[collapsible=icon]:justify-center">
          <span className="truncate group-data-[collapsible=icon]:hidden">
            © {CURRENT_YEAR} Anlew
          </span>
          <span className="font-mono text-[10px] text-muted-foreground/80 group-data-[collapsible=icon]:hidden">
            v1.0
          </span>
        </div>
      </SidebarFooter>

      {/* Sidebar resize & toggle rail */}
      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
