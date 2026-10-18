import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Trash2,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getApiErrorMessage, iamService, type RoleItem } from '@/services';

export const RolesPage = () => {
  const { t } = useTranslation();

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshIndex, setRefreshIndex] = useState(0);

  // Create / Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [formKey, setFormKey] = useState('');
  const [formName, setFormName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Delete modal
  const [deleteRoleItem, setDeleteRoleItem] = useState<RoleItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    iamService
      .getRoles({ page, page_size: pageSize })
      .then((res) => {
        if (!active) return;
        setRoles(res.data);
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
  }, [page, pageSize, refreshIndex, t]);

  const handleOpenCreate = () => {
    setEditingRole(null);
    setFormKey('');
    setFormName('');
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (role: RoleItem) => {
    setEditingRole(role);
    setFormKey(role.key);
    setFormName(role.name);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setActionLoading(true);
    setFormError(null);
    try {
      if (editingRole) {
        await iamService.updateRole(editingRole.id, { name: formName.trim() });
      } else {
        if (!formKey.trim()) return;
        await iamService.createRole({
          key: formKey.trim().toLowerCase(),
          name: formName.trim(),
        });
      }
      setModalOpen(false);
      setRefreshIndex((i) => i + 1);
    } catch (err: unknown) {
      setFormError(getApiErrorMessage(err, t('iam.common.error')));
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDelete = (role: RoleItem) => {
    setDeleteRoleItem(role);
    setDeleteError(null);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteRoleItem) return;
    setActionLoading(true);
    setDeleteError(null);
    try {
      await iamService.deleteRole(deleteRoleItem.id);
      setDeleteOpen(false);
      setRefreshIndex((i) => i + 1);
    } catch (err: unknown) {
      setDeleteError(getApiErrorMessage(err, t('iam.common.error')));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t('iam.roles.title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('iam.roles.subtitle')}
          </p>
        </div>
        <Button type="button" onClick={handleOpenCreate} size="sm">
          <Plus className="mr-1.5 size-4" />
          {t('iam.roles.createRole')}
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-0">
          {error && (
            <div className="p-4 text-sm text-destructive bg-destructive/10">
              {error}
            </div>
          )}

          <div className="w-full min-w-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('iam.roles.colKey')}</TableHead>
                  <TableHead>{t('iam.roles.colName')}</TableHead>
                  <TableHead>{t('iam.roles.colUsers')}</TableHead>
                  <TableHead>{t('iam.roles.colCreated')}</TableHead>
                  <TableHead className="text-right">
                    {t('iam.common.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {t('iam.common.loading')}
                    </TableCell>
                  </TableRow>
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {t('iam.common.noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs font-semibold text-foreground">
                        {r.key}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {r.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.user_count}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenEdit(r)}
                            aria-label={t('iam.common.edit')}
                            title={t('iam.common.edit')}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenDelete(r)}
                            aria-label={t('iam.common.delete')}
                            title={t('iam.common.delete')}
                            className="text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

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

      {/* Create / Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveRole}>
            <DialogHeader>
              <DialogTitle>
                {editingRole
                  ? t('iam.roles.editTitle')
                  : t('iam.roles.createTitle')}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-3 text-sm">
              {formError && (
                <div className="rounded-md bg-destructive/10 p-2.5 text-sm text-destructive">
                  {formError}
                </div>
              )}

              {!editingRole && (
                <div>
                  <Label htmlFor="role-key" className="mb-1.5">
                    {t('iam.roles.roleKey')}
                  </Label>
                  <Input
                    id="role-key"
                    value={formKey}
                    onChange={(e) => setFormKey(e.target.value)}
                    placeholder="e.g. support_lead"
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="role-name" className="mb-1.5">
                  {t('iam.roles.roleName')}
                </Label>
                <Input
                  id="role-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Support Team Lead"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                disabled={actionLoading}
              >
                {t('iam.common.cancel')}
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? t('iam.common.loading') : t('iam.common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('iam.common.delete')}</DialogTitle>
            <DialogDescription>
              {t('iam.roles.deleteConfirm')}
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <div className="rounded-md bg-destructive/10 p-2.5 text-sm text-destructive">
              {deleteError}
            </div>
          )}

          <div className="space-y-2 py-2 text-sm">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('iam.roles.colName')}:</span>
              <span className="font-medium text-foreground">
                {deleteRoleItem?.name} ({deleteRoleItem?.key})
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('iam.roles.colUsers')}:</span>
              <span className="font-medium text-foreground">
                {deleteRoleItem?.user_count ?? 0}
              </span>
            </div>

            {deleteRoleItem?.key === 'admin' ? (
              <Alert variant="destructive" className="mt-3">
                <AlertTriangle className="size-4" aria-hidden="true" />
                <AlertTitle>{t('iam.roles.cannotDeleteAdmin')}</AlertTitle>
                <AlertDescription className="mt-1 text-xs">
                  {t('iam.roles.deleteAdminWarning')}
                </AlertDescription>
              </Alert>
            ) : (deleteRoleItem?.user_count ?? 0) > 0 ? (
              <Alert variant="destructive" className="mt-3">
                <AlertTriangle className="size-4" aria-hidden="true" />
                <AlertTitle>{t('iam.roles.cannotDeleteInUse')}</AlertTitle>
                <AlertDescription className="mt-1 text-xs">
                  {t('iam.roles.deleteInUseWarning', {
                    count: deleteRoleItem?.user_count,
                  })}
                </AlertDescription>
              </Alert>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={actionLoading}
            >
              {t('iam.common.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={
                actionLoading ||
                deleteRoleItem?.key === 'admin' ||
                (deleteRoleItem?.user_count ?? 0) > 0
              }
            >
              {actionLoading
                ? t('iam.common.loading')
                : t('iam.common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesPage;
