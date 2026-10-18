import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ExternalLink,
  Home,
  LogOut,
  Search,
  Settings,
  User as UserIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { authService, type UserProfile } from '@/services';

export interface HeaderProps {
  user?: UserProfile | null;
  showSidebarTrigger?: boolean;
}

export const Header = ({
  user: propUser,
  showSidebarTrigger = false,
}: HeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [fetchedUser, setFetchedUser] = useState<UserProfile | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    if (propUser !== undefined) {
      return;
    }

    let active = true;
    void authService
      .getCurrentUser()
      .then((profile) => {
        if (active) {
          setFetchedUser(profile);
        }
      })
      .catch(() => {
        // Handled by route guard if unauthenticated
      });

    return () => {
      active = false;
    };
  }, [propUser]);

  const user = propUser !== undefined ? propUser : fetchedUser;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        const target = e.target;
        if (
          target instanceof HTMLElement &&
          (target.isContentEditable ||
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT')
        ) {
          return;
        }
        e.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      navigate('/auth/login', { replace: true });
    }
  };

  const handleProfile = () => {
    navigate('/a/profile');
  };

  const handleSettings = () => {
    navigate('/a/settings');
  };

  const executeCommand = (action: () => void) => {
    setIsCommandOpen(false);
    action();
  };

  const displayName =
    user?.display_name || user?.email || t('header.menu.defaultUser');
  const initial = (
    user?.display_name?.[0] ||
    user?.email?.[0] ||
    'A'
  ).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Left: Brand Logo & Optional Sidebar Trigger */}
          <div className="flex shrink-0 items-center gap-2">
            {showSidebarTrigger && (
              <>
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-1 hidden h-4 sm:block"
                />
              </>
            )}
            <Link
              to={showSidebarTrigger ? '/a' : '/'}
              className="flex items-center gap-2.5 rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground shadow-xs">
                A
              </div>
              <div className="hidden flex-col sm:flex">
                <span className="text-sm font-bold tracking-tight text-foreground">
                  Anlew
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  {t('header.brandSubtitle')}
                </span>
              </div>
            </Link>
          </div>

          {/* Middle: Quick search box combined with command palette */}
          <div className="flex flex-1 items-center justify-center px-2">
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              className="flex h-9 w-full max-w-xs cursor-pointer items-center justify-between gap-2 rounded-lg border border-input bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground shadow-2xs transition-colors hover:border-border hover:bg-muted/80 hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring sm:max-w-sm sm:text-sm"
              aria-label={t('header.search.ariaLabel')}
            >
              <div className="flex min-w-0 items-center gap-2 truncate">
                <Search
                  className="size-4 shrink-0 opacity-60"
                  aria-hidden="true"
                />
                <span className="hidden truncate sm:inline-block">
                  {t('header.search.placeholder')}
                </span>
                <span className="inline-block truncate sm:hidden">
                  {t('header.search.shortPlaceholder')}
                </span>
              </div>
              <KbdGroup className="hidden shrink-0 sm:inline-flex">
                <Kbd className="font-mono text-[10px] uppercase">⌘K</Kbd>
              </KbdGroup>
            </button>
          </div>

          {/* Right: User logo/avatar + name combined with menu, or Sign in button */}
          <div className="flex shrink-0 items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-transparent p-1.5 text-left text-sm font-medium transition-colors hover:bg-muted/60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring sm:px-2.5 sm:py-1.5"
                  aria-label={t('header.menu.userMenuAriaLabel')}
                >
                  <Avatar size="sm" className="size-8">
                    {user?.avatar_url ? (
                      <AvatarImage src={user.avatar_url} alt={displayName} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col text-left sm:flex">
                    <span className="max-w-28 truncate text-xs font-semibold leading-tight text-foreground md:max-w-36">
                      {displayName}
                    </span>
                    {user?.email ? (
                      <span className="max-w-28 truncate text-[10px] leading-tight text-muted-foreground md:max-w-36">
                        {user.email}
                      </span>
                    ) : null}
                  </div>
                  <ChevronDown
                    className="size-3.5 text-muted-foreground transition-transform duration-200"
                    aria-hidden="true"
                  />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-56"
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-foreground">
                          {displayName}
                        </p>
                        {user?.email ? (
                          <p className="max-w-48 truncate text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        ) : null}
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={handleProfile}>
                      <UserIcon aria-hidden="true" />
                      <span>{t('header.menu.profile')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSettings}>
                      <Settings aria-hidden="true" />
                      <span>{t('header.menu.settings')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={handleLogout}
                    >
                      <LogOut aria-hidden="true" />
                      <span>{t('header.menu.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                render={<Link to="/auth/login" />}
                size="sm"
                variant="outline"
              >
                {t('header.actions.signIn')}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Command Palette Dialog */}
      <CommandDialog
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
        title={t('header.commandPalette.title')}
        description={t('header.commandPalette.description')}
        className="sm:max-w-lg"
      >
        <Command className="border-none shadow-none">
          <CommandInput
            placeholder={t('header.commandPalette.inputPlaceholder')}
          />
          <CommandList>
            <CommandEmpty>{t('header.commandPalette.empty')}</CommandEmpty>
            <CommandGroup
              heading={t('header.commandPalette.groups.navigation')}
            >
              <CommandItem
                onSelect={() =>
                  executeCommand(() =>
                    navigate(showSidebarTrigger ? '/a' : '/'),
                  )
                }
              >
                <Home aria-hidden="true" />
                <span>{t('header.menu.home')}</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  executeCommand(() =>
                    window.open('https://github.com', '_blank', 'noreferrer'),
                  )
                }
              >
                <ExternalLink aria-hidden="true" />
                <span>{t('header.menu.documentation')}</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading={t('header.commandPalette.groups.account')}>
              <CommandItem onSelect={() => executeCommand(handleProfile)}>
                <UserIcon aria-hidden="true" />
                <span>{t('header.menu.profile')}</span>
              </CommandItem>
              <CommandItem onSelect={() => executeCommand(handleSettings)}>
                <Settings aria-hidden="true" />
                <span>{t('header.menu.settings')}</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading={t('header.commandPalette.groups.actions')}>
              <CommandItem
                className="text-destructive data-selected:bg-destructive/10 data-selected:text-destructive"
                onSelect={() => executeCommand(handleLogout)}
              >
                <LogOut aria-hidden="true" />
                <span>{t('header.menu.logout')}</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
};

export default Header;
