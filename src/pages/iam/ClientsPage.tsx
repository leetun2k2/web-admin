import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Fingerprint,
  Plus,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Spinner } from '@/components/ui/spinner';
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
  type ClientRegistrationItem,
} from '@/services';

const PROVIDERS = ['google', 'github'] as const;

interface RegisterFormState {
  provider: string;
  clientId: string;
  name: string;
  clientSecret: string;
  authSecret: string;
  redirectUrl: string;
  redirectUris: string;
  enabled: boolean;
}

const emptyRegisterForm: RegisterFormState = {
  provider: PROVIDERS[0],
  clientId: '',
  name: '',
  clientSecret: '',
  authSecret: '',
  redirectUrl: '',
  redirectUris: '',
  enabled: true,
};

export const ClientsPage = () => {
  const { t } = useTranslation();

  const [clients, setClients] = useState<ClientRegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshIndex, setRefreshIndex] = useState(0);

  // Enable / disable modal
  const [toggleItem, setToggleItem] = useState<ClientRegistrationItem | null>(
    null,
  );
  const [toggleOpen, setToggleOpen] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Register / upsert modal
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] =
    useState<RegisterFormState>(emptyRegisterForm);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);

  // Details modal
  const [detailsItem, setDetailsItem] = useState<ClientRegistrationItem | null>(
    null,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    iamService
      .getClients({ page, page_size: pageSize })
      .then((res) => {
        if (!active) return;
        setClients(res.data);
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

  const handleOpenToggle = (client: ClientRegistrationItem) => {
    setToggleItem(client);
    setToggleError(null);
    setToggleOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!toggleItem) return;
    setActionLoading(true);
    setToggleError(null);
    try {
      await iamService.updateClientEnabled(toggleItem.id, !toggleItem.enabled);
      setToggleOpen(false);
      setRefreshIndex((i) => i + 1);
    } catch (err: unknown) {
      setToggleError(getApiErrorMessage(err, t('iam.common.error')));
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRegister = () => {
    setRegisterForm(emptyRegisterForm);
    setRegisterError(null);
    setRegisterOpen(true);
  };

  const handleOpenDetails = (client: ClientRegistrationItem) => {
    setDetailsItem(client);
    setDetailsOpen(true);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const clientId = registerForm.clientId.trim();
    const name = registerForm.name.trim();
    const clientSecret = registerForm.clientSecret.trim();
    const authSecret = registerForm.authSecret.trim();
    const redirectUrl = registerForm.redirectUrl.trim();
    const redirectUris = registerForm.redirectUris
      .split(',')
      .map((uri) => uri.trim())
      .filter((uri) => uri.length > 0);

    if (
      !clientId ||
      !name ||
      !clientSecret ||
      !authSecret ||
      !redirectUrl ||
      redirectUris.length === 0
    ) {
      setRegisterError(t('iam.clients.formIncomplete'));
      return;
    }

    setRegisterLoading(true);
    setRegisterError(null);
    try {
      await iamService.upsertClient(registerForm.provider, clientId, {
        name,
        client_secret: clientSecret,
        auth_secret: authSecret,
        redirect_url: redirectUrl,
        redirect_uris: redirectUris,
        enabled: registerForm.enabled,
      });
      setRegisterForm(emptyRegisterForm);
      setRegisterOpen(false);
      setRefreshIndex((i) => i + 1);
    } catch (err: unknown) {
      setRegisterError(getApiErrorMessage(err, t('iam.common.error')));
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t('iam.clients.title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('iam.clients.subtitle')}
          </p>
        </div>
        <Button type="button" onClick={handleOpenRegister} size="sm">
          <Plus className="mr-1.5 size-4" />
          {t('iam.clients.registerButton')}
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
                  <TableHead>{t('iam.clients.colProvider')}</TableHead>
                  <TableHead>{t('iam.clients.colId')}</TableHead>
                  <TableHead>{t('iam.clients.colName')}</TableHead>
                  <TableHead>{t('iam.clients.colCallbackUrl')}</TableHead>
                  <TableHead>{t('iam.clients.colRedirects')}</TableHead>
                  <TableHead>{t('iam.clients.colStatus')}</TableHead>
                  <TableHead className="text-right">
                    {t('iam.common.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {t('iam.common.loading')}
                    </TableCell>
                  </TableRow>
                ) : clients.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {t('iam.common.noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {c.provider}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {c.client_id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Fingerprint className="size-4 text-primary" />
                          <span className="font-semibold text-foreground">
                            {c.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] text-xs text-muted-foreground">
                        <div
                          className="max-w-[200px] truncate"
                          title={c.redirect_url || undefined}
                        >
                          {c.redirect_url || '—'}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] text-xs text-muted-foreground">
                        <div
                          className="max-w-[200px] truncate"
                          title={
                            c.redirect_uris.length > 0
                              ? c.redirect_uris.join(', ')
                              : undefined
                          }
                        >
                          {c.redirect_uris.length > 0
                            ? c.redirect_uris.join(', ')
                            : '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={c.enabled ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {c.enabled
                            ? t('iam.common.enabled')
                            : t('iam.common.disabled')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenDetails(c)}
                            aria-label={t('iam.clients.viewDetails')}
                            title={t('iam.clients.viewDetails')}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenToggle(c)}
                          >
                            {c.enabled
                              ? t('iam.clients.disable')
                              : t('iam.clients.enable')}
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

      {/* Register / Upsert Dialog */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleRegisterSubmit}>
            <DialogHeader>
              <DialogTitle>{t('iam.clients.registerTitle')}</DialogTitle>
              <DialogDescription>
                {t('iam.clients.registerSubtitle')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-sm">
              {registerError && (
                <div className="rounded-md bg-destructive/10 p-2.5 text-sm text-destructive">
                  {registerError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="client-provider" className="mb-1.5">
                    {t('iam.clients.fieldProvider')}
                  </Label>
                  <NativeSelect
                    id="client-provider"
                    className="w-full"
                    value={registerForm.provider}
                    onChange={(e) =>
                      setRegisterForm((f) => ({
                        ...f,
                        provider: e.target.value,
                      }))
                    }
                  >
                    {PROVIDERS.map((provider) => (
                      <NativeSelectOption
                        key={provider}
                        value={provider}
                        className="capitalize"
                      >
                        {provider}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>

                <div>
                  <Label htmlFor="client-id" className="mb-1.5">
                    {t('iam.clients.fieldClientId')}
                  </Label>
                  <Input
                    id="client-id"
                    value={registerForm.clientId}
                    onChange={(e) =>
                      setRegisterForm((f) => ({
                        ...f,
                        clientId: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="client-name" className="mb-1.5">
                  {t('iam.clients.fieldName')}
                </Label>
                <Input
                  id="client-name"
                  value={registerForm.name}
                  onChange={(e) =>
                    setRegisterForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="client-secret" className="mb-1.5">
                  {t('iam.clients.fieldClientSecret')}
                </Label>
                <Input
                  id="client-secret"
                  type="password"
                  autoComplete="new-password"
                  value={registerForm.clientSecret}
                  onChange={(e) =>
                    setRegisterForm((f) => ({
                      ...f,
                      clientSecret: e.target.value,
                    }))
                  }
                  aria-describedby="client-secret-help"
                  required
                />
                <p
                  id="client-secret-help"
                  className="mt-1 text-xs text-muted-foreground"
                >
                  {t('iam.clients.fieldClientSecretHelp')}
                </p>
              </div>

              <div>
                <Label htmlFor="auth-secret" className="mb-1.5">
                  {t('iam.clients.fieldAuthSecret')}
                </Label>
                <Input
                  id="auth-secret"
                  type="password"
                  autoComplete="new-password"
                  value={registerForm.authSecret}
                  onChange={(e) =>
                    setRegisterForm((f) => ({
                      ...f,
                      authSecret: e.target.value,
                    }))
                  }
                  aria-describedby="auth-secret-help"
                  required
                />
                <p
                  id="auth-secret-help"
                  className="mt-1 text-xs text-muted-foreground"
                >
                  {t('iam.clients.fieldAuthSecretHelp')}
                </p>
              </div>

              <div>
                <Label htmlFor="redirect-url" className="mb-1.5">
                  {t('iam.clients.fieldRedirectUrl')}
                </Label>
                <Input
                  id="redirect-url"
                  value={registerForm.redirectUrl}
                  onChange={(e) =>
                    setRegisterForm((f) => ({
                      ...f,
                      redirectUrl: e.target.value,
                    }))
                  }
                  placeholder="http://admin.anlew.local/api/auth/v1/callback/google"
                  required
                />
              </div>

              <div>
                <Label htmlFor="redirect-uris" className="mb-1.5">
                  {t('iam.clients.fieldRedirectUris')}
                </Label>
                <Input
                  id="redirect-uris"
                  value={registerForm.redirectUris}
                  onChange={(e) =>
                    setRegisterForm((f) => ({
                      ...f,
                      redirectUris: e.target.value,
                    }))
                  }
                  placeholder="http://admin.anlew.local/auth/callback"
                  aria-describedby="redirect-uris-help"
                  required
                />
                <p
                  id="redirect-uris-help"
                  className="mt-1 text-xs text-muted-foreground"
                >
                  {t('iam.clients.fieldRedirectUrisHelp')}
                </p>
              </div>

              <Label htmlFor="client-enabled">
                <Checkbox
                  id="client-enabled"
                  checked={registerForm.enabled}
                  onCheckedChange={(checked) =>
                    setRegisterForm((f) => ({ ...f, enabled: checked }))
                  }
                />
                {t('iam.clients.fieldEnabled')}
              </Label>

              <p className="rounded-md bg-muted p-2.5 text-xs text-muted-foreground">
                {t('iam.clients.secretsNote')}
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRegisterOpen(false)}
                disabled={registerLoading}
              >
                {t('iam.common.cancel')}
              </Button>
              <Button type="submit" disabled={registerLoading}>
                {registerLoading && <Spinner className="mr-1.5" />}
                {registerLoading
                  ? t('iam.common.loading')
                  : t('iam.common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('iam.clients.detailsModalTitle')}</DialogTitle>
            <DialogDescription>{detailsItem?.name}</DialogDescription>
          </DialogHeader>

          {detailsItem && (
            <div className="space-y-3 py-2 text-sm">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('iam.clients.detailsId')}
                </span>
                <p className="mt-1 font-mono text-xs text-foreground">
                  {detailsItem.id}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('iam.clients.colProvider')}
                </span>
                <p className="mt-1 capitalize text-foreground">
                  {detailsItem.provider}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('iam.clients.colId')}
                </span>
                <p className="mt-1 font-mono text-xs text-foreground">
                  {detailsItem.client_id}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('iam.clients.colName')}
                </span>
                <p className="mt-1 text-foreground">{detailsItem.name}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('iam.clients.colCallbackUrl')}
                </span>
                <p className="mt-1 break-all text-xs text-foreground">
                  {detailsItem.redirect_url || '—'}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('iam.clients.colRedirects')}
                </span>
                {detailsItem.redirect_uris.length > 0 ? (
                  <ul className="mt-1 space-y-0.5">
                    {detailsItem.redirect_uris.map((uri) => (
                      <li
                        key={uri}
                        className="break-all font-mono text-xs text-foreground"
                      >
                        {uri}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-xs text-foreground">—</p>
                )}
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('iam.clients.colStatus')}
                </span>
                <div className="mt-1">
                  <Badge
                    variant={detailsItem.enabled ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {detailsItem.enabled
                      ? t('iam.common.enabled')
                      : t('iam.common.disabled')}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('iam.clients.detailsCreatedAt')}
                  </span>
                  <p className="mt-1 text-xs text-foreground">
                    {new Date(detailsItem.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('iam.clients.detailsUpdatedAt')}
                  </span>
                  <p className="mt-1 text-xs text-foreground">
                    {new Date(detailsItem.updated_at).toLocaleString()}
                  </p>
                </div>
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

      {/* Enable / Disable Confirmation Dialog */}
      <Dialog open={toggleOpen} onOpenChange={setToggleOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {toggleItem?.enabled
                ? t('iam.clients.disable')
                : t('iam.clients.enable')}
            </DialogTitle>
            <DialogDescription>
              {toggleItem?.enabled
                ? t('iam.clients.disableConfirm')
                : t('iam.clients.enableConfirm')}
            </DialogDescription>
          </DialogHeader>

          {toggleError && (
            <div className="rounded-md bg-destructive/10 p-2.5 text-sm text-destructive">
              {toggleError}
            </div>
          )}

          <div className="py-2 text-xs text-muted-foreground">
            {t('iam.clients.colName')}:{' '}
            <strong className="text-foreground">{toggleItem?.name}</strong>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setToggleOpen(false)}
              disabled={actionLoading}
            >
              {t('iam.common.cancel')}
            </Button>
            <Button
              type="button"
              variant={toggleItem?.enabled ? 'destructive' : 'default'}
              onClick={handleConfirmToggle}
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

export default ClientsPage;
