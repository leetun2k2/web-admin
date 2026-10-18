import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  type IdentitySummary,
} from '@/services';

export const IdentitiesPage = () => {
  const { t } = useTranslation();

  const [identities, setIdentities] = useState<IdentitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & filter
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [providerFilter, setProviderFilter] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    iamService
      .getIdentities({
        page,
        page_size: pageSize,
        provider: providerFilter || undefined,
      })
      .then((res) => {
        if (!active) return;
        setIdentities(res.data);
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
  }, [page, pageSize, providerFilter, t]);

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t('iam.identities.title')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('iam.identities.subtitle')}
        </p>
      </div>

      {/* Filter Card */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            {t('iam.common.filter')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="identities-provider-filter" className="mb-1.5">
              {t('iam.identities.colProvider')}
            </Label>
            <NativeSelect
              id="identities-provider-filter"
              value={providerFilter}
              onChange={(e) => {
                setProviderFilter(e.target.value);
                setPage(1);
              }}
            >
              <NativeSelectOption value="">
                {t('iam.common.all')}
              </NativeSelectOption>
              <NativeSelectOption value="google">Google</NativeSelectOption>
              <NativeSelectOption value="github">GitHub</NativeSelectOption>
            </NativeSelect>
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

          <div className="w-full min-w-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('iam.identities.colProvider')}</TableHead>
                  <TableHead>{t('iam.identities.colSubject')}</TableHead>
                  <TableHead>{t('iam.identities.colUserEmail')}</TableHead>
                  <TableHead>{t('iam.identities.colName')}</TableHead>
                  <TableHead>{t('iam.identities.colVerified')}</TableHead>
                  <TableHead>{t('iam.identities.colCreated')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {t('iam.common.loading')}
                    </TableCell>
                  </TableRow>
                ) : identities.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {t('iam.common.noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  identities.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="size-4 text-primary" />
                          <span className="font-medium capitalize text-foreground">
                            {item.provider}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {item.provider_subject}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {item.user_email || '—'}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {item.display_name || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.email_verified ? 'default' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {item.email_verified
                            ? t('iam.identities.verified')
                            : t('iam.identities.unverified')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
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
    </div>
  );
};

export default IdentitiesPage;
