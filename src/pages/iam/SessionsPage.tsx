import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, KeyRound, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getApiErrorMessage, iamService, type SessionItem } from '@/services';

export const SessionsPage = () => {
  const { t } = useTranslation();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & filter
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeOnly, setActiveOnly] = useState(true);
  const [refreshIndex, setRefreshIndex] = useState(0);

  // Revoke modal
  const [revokeItem, setRevokeItem] = useState<SessionItem | null>(null);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    iamService
      .getSessions({ page, page_size: pageSize, active: activeOnly })
      .then((res) => {
        if (!active) return;
        setSessions(res.data);
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
  }, [page, pageSize, activeOnly, refreshIndex, t]);

  const handleOpenRevoke = (s: SessionItem) => {
    setRevokeItem(s);
    setRevokeError(null);
    setRevokeOpen(true);
  };

  const handleConfirmRevoke = async () => {
    if (!revokeItem) return;
    setActionLoading(true);
    setRevokeError(null);
    try {
      await iamService.revokeSession(revokeItem.id);
      setRevokeOpen(false);
      setRefreshIndex((i) => i + 1);
    } catch (err: unknown) {
      setRevokeError(getApiErrorMessage(err, t('iam.common.error')));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t('iam.sessions.title')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('iam.sessions.subtitle')}
        </p>
      </div>

      {/* Filter Card */}
      <Card className="border-border shadow-xs">
        <CardContent className="py-3">
          <label
            htmlFor="sessions-active-only"
            className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground"
          >
            <input
              id="sessions-active-only"
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => {
                setActiveOnly(e.target.checked);
                setPage(1);
              }}
              className="rounded border-input text-primary focus:ring-primary"
            />
            {t('iam.sessions.activeOnly')}
          </label>
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

          <div className="w-full min-w-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('iam.sessions.colId')}</TableHead>
                  <TableHead>{t('iam.sessions.colUser')}</TableHead>
                  <TableHead>{t('iam.sessions.colClient')}</TableHead>
                  <TableHead>{t('iam.sessions.colProvider')}</TableHead>
                  <TableHead>{t('iam.sessions.colCreated')}</TableHead>
                  <TableHead>{t('iam.sessions.colExpires')}</TableHead>
                  <TableHead>{t('iam.common.status')}</TableHead>
                  <TableHead className="text-right">
                    {t('iam.common.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {t('iam.common.loading')}
                    </TableCell>
                  </TableRow>
                ) : sessions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {t('iam.common.noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {s.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <KeyRound className="size-4 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">
                              {s.user_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {s.user_email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {s.client_name}
                      </TableCell>
                      <TableCell className="text-xs capitalize text-muted-foreground">
                        {s.provider}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(s.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(s.expires_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {s.revoked_at ? (
                          <Badge variant="secondary" className="text-[10px]">
                            {t('iam.sessions.revoked')}
                          </Badge>
                        ) : (
                          <Badge variant="default" className="text-[10px]">
                            {t('iam.common.active')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!s.revoked_at && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenRevoke(s)}
                            aria-label={t('iam.sessions.revoke')}
                            title={t('iam.sessions.revoke')}
                            className="text-destructive"
                          >
                            <LogOut className="size-4" />
                          </Button>
                        )}
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

      {/* Revoke Confirmation Dialog */}
      <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('iam.sessions.revoke')}</DialogTitle>
            <DialogDescription>
              {t('iam.sessions.revokeConfirm')}
            </DialogDescription>
          </DialogHeader>

          {revokeError && (
            <div className="rounded-md bg-destructive/10 p-2.5 text-sm text-destructive">
              {revokeError}
            </div>
          )}

          <div className="py-2 text-xs text-muted-foreground">
            {t('iam.sessions.colUser')}:{' '}
            <strong className="text-foreground">
              {revokeItem?.user_email}
            </strong>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRevokeOpen(false)}
              disabled={actionLoading}
            >
              {t('iam.common.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmRevoke}
              disabled={actionLoading}
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

export default SessionsPage;
