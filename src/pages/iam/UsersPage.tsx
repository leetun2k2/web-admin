import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Eye, Search, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getApiErrorMessage,
  iamService,
  type RoleItem,
  type UserDetail,
  type UserSummary,
} from '@/services';

export const UsersPage = () => {
  const { t } = useTranslation();

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & filters
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [allRoles, setAllRoles] = useState<RoleItem[]>([]);
  const [refreshIndex, setRefreshIndex] = useState(0);

  // Details dialog
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Edit roles dialog
  const [rolesOpen, setRolesOpen] = useState(false);
  const [rolesTarget, setRolesTarget] = useState<UserDetail | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    iamService
      .getRoles({ page_size: 100 })
      .then((res) => setAllRoles(res.data))
      .catch(() => {
        // Role filter is a convenience; failures here do not block the page
      });
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    iamService
      .getUsers({
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
      })
      .then((res) => {
        if (!active) return;
        setUsers(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.total_pages);
          setTotalItems(res.pagination.total_items);
        }
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(getApiErrorMessage(err, t('iam.common.error')));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, pageSize, search, roleFilter, refreshIndex, t]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleOpenDetails = async (userId: string) => {
    setDetailsError(null);
    setDetailsOpen(true);
    try {
      const detail = await iamService.getUser(userId);
      setSelectedUser(detail);
    } catch (err: unknown) {
      setDetailsError(getApiErrorMessage(err, t('iam.common.error')));
    }
  };

  const handleOpenRoles = async (user: UserSummary) => {
    setRolesError(null);
    setRolesOpen(true);
    try {
      const detail = await iamService.getUser(user.id);
      setRolesTarget(detail);
      const activeIds = allRoles
        .filter((r) => detail.roles.includes(r.key))
        .map((r) => r.id);
      setSelectedRoleIds(activeIds);
    } catch (err: unknown) {
      setRolesError(getApiErrorMessage(err, t('iam.common.error')));
    }
  };

  const handleSaveRoles = async () => {
    if (!rolesTarget) return;
    setActionLoading(true);
    setRolesError(null);
    try {
      await iamService.updateUserRoles(rolesTarget.id, selectedRoleIds);
      setRolesOpen(false);
      setRefreshIndex((i) => i + 1);
    } catch (err: unknown) {
      setRolesError(getApiErrorMessage(err, t('iam.common.error')));
    } finally {
      setActionLoading(false);
    }
  };

  const toggleRoleSelection = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t('iam.users.title')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('iam.users.subtitle')}
        </p>
      </div>

      {/* Filter / Search Card */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            {t('iam.common.filter')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-1 items-end gap-2"
            >
              <div className="flex-1 max-w-sm">
                <Label htmlFor="users-search" className="mb-1.5">
                  {t('iam.common.search')}
                </Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="users-search"
                    type="text"
                    placeholder={t('iam.common.search')}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Button type="submit" variant="secondary" size="sm">
                {t('iam.common.filter')}
              </Button>
            </form>

            <div>
              <Label htmlFor="users-role-filter" className="mb-1.5">
                {t('iam.users.filterRole')}
              </Label>
              <NativeSelect
                id="users-role-filter"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
              >
                <NativeSelectOption value="">
                  {t('iam.common.all')}
                </NativeSelectOption>
                {allRoles.map((role) => (
                  <NativeSelectOption key={role.id} value={role.key}>
                    {role.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-0">
          {error && (
            <div className="p-4 text-sm text-destructive bg-destructive/10">
              {error}
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('iam.users.colEmail')}</TableHead>
                <TableHead>{t('iam.users.colDisplayName')}</TableHead>
                <TableHead>{t('iam.users.colRoles')}</TableHead>
                <TableHead className="text-right">
                  {t('iam.common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {t('iam.common.loading')}
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {t('iam.common.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {u.avatar_url ? (
                          <img
                            src={u.avatar_url}
                            alt=""
                            className="size-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {(u.display_name ||
                              u.email ||
                              'U')[0].toUpperCase()}
                          </div>
                        )}
                        <span className="text-foreground">
                          {u.email || '—'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {u.display_name || '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.roles && u.roles.length > 0 ? (
                          u.roles.map((r) => (
                            <Badge
                              key={r}
                              variant="outline"
                              className="text-xs"
                            >
                              {r}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenDetails(u.id)}
                          aria-label={t('iam.users.viewDetails')}
                          title={t('iam.users.viewDetails')}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenRoles(u)}
                          aria-label={t('iam.users.manageRoles')}
                          title={t('iam.users.manageRoles')}
                        >
                          <Shield className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination bar */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-6">
            <span className="text-xs text-muted-foreground">
              {t('iam.common.page', { current: page, total: totalPages })} (
              {totalItems} total)
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-4" />
                <span className="hidden sm:inline">{t('iam.common.prev')}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <span className="hidden sm:inline">{t('iam.common.next')}</span>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('iam.users.detailsModalTitle')}</DialogTitle>
            <DialogDescription>{selectedUser?.email}</DialogDescription>
          </DialogHeader>

          {detailsError && (
            <div className="rounded-md bg-destructive/10 p-2.5 text-sm text-destructive">
              {detailsError}
            </div>
          )}

          {selectedUser && (
            <div className="space-y-4 py-2 text-sm">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('iam.users.userId')}
                </span>
                <p className="mt-1 font-mono text-xs text-foreground">
                  {selectedUser.id}
                </p>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('iam.users.linkedIdentities')}
                </h4>
                {selectedUser.identities.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.identities.map((id) => (
                      <div
                        key={id.id}
                        className="flex items-center justify-between rounded-lg border border-border p-2.5"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize text-foreground">
                              {id.provider}
                            </span>
                            {id.email_verified && (
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                              >
                                {t('iam.identities.verified')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {id.email || id.provider_subject}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(id.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t('iam.users.noIdentities')}
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDetailsOpen(false)}
            >
              {t('iam.common.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Roles Dialog */}
      <Dialog open={rolesOpen} onOpenChange={setRolesOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('iam.users.rolesModalTitle')}</DialogTitle>
            <DialogDescription>
              {t('iam.users.rolesModalDesc')} {rolesTarget?.email}
            </DialogDescription>
          </DialogHeader>

          {rolesError && (
            <div className="rounded-md bg-destructive/10 p-2.5 text-sm text-destructive">
              {rolesError}
            </div>
          )}

          <div className="max-h-60 space-y-2 overflow-y-auto py-2">
            {allRoles.map((role) => {
              const inputId = `role-${role.id}`;
              return (
                <label
                  key={role.id}
                  htmlFor={inputId}
                  className="flex items-start gap-3 rounded-lg border border-border p-2.5 cursor-pointer hover:bg-muted/50"
                >
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={selectedRoleIds.includes(role.id)}
                    onChange={() => toggleRoleSelection(role.id)}
                    className="mt-0.5 rounded border-input text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {role.name}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {role.key}
                      </Badge>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRolesOpen(false)}
              disabled={actionLoading}
            >
              {t('iam.common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleSaveRoles}
              disabled={actionLoading || !rolesTarget}
            >
              {actionLoading ? t('iam.common.loading') : t('iam.common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
