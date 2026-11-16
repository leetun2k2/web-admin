import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, ArrowRight, Package, Plus, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  getApiErrorMessage,
  productService,
  type ProductItem,
} from '@/services';

export const ProductsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Create Dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createCode, setCreateCode] = useState('');
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.listProducts();
      setProducts(data);
    } catch (err) {
      setError(
        getApiErrorMessage(err, t('catalog.errors.service_unavailable')),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createCode.trim() || !createName.trim()) {
      setCreateError(t('catalog.errors.invalid_request'));
      return;
    }

    setCreateLoading(true);
    setCreateError(null);
    try {
      const created = await productService.createProduct({
        code: createCode.trim(),
        name: createName.trim(),
        description: createDesc.trim() || undefined,
      });
      setCreateOpen(false);
      setCreateCode('');
      setCreateName('');
      setCreateDesc('');
      setProducts((prev) => [...prev, created]);
      navigate(`/app/products/${created.id}`);
    } catch (err) {
      setCreateError(getApiErrorMessage(err, t('catalog.errors.conflict')));
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      p.code.toLowerCase().includes(term) ||
      p.name.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('catalog.products.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('catalog.products.subtitle')}
          </p>
        </div>
        <Button
          onClick={() => {
            setCreateError(null);
            setCreateOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="size-4" />
          {t('catalog.products.createButton')}
        </Button>
      </header>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{t('common.errors.unexpected')}</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProducts}
              className="mt-2 sm:mt-0"
            >
              {t('common.actions.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="p-4 sm:p-6 pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold">
              {t('catalog.products.title')} ({filteredProducts.length})
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('catalog.products.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Spinner className="size-8 text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Package className="size-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                {t('catalog.products.empty')}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('catalog.products.colCode')}</TableHead>
                  <TableHead>{t('catalog.products.colName')}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t('catalog.products.colDescription')}
                  </TableHead>
                  <TableHead>{t('catalog.products.colStatus')}</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    {t('catalog.products.colCreatedAt')}
                  </TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/app/products/${product.id}`)}
                  >
                    <TableCell className="font-mono text-xs font-semibold">
                      {product.code}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {product.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs max-w-xs truncate">
                      {product.description || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === 'active' ? 'default' : 'secondary'
                        }
                        className="capitalize"
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                      {new Date(product.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/products/${product.id}`);
                        }}
                        className="gap-1 text-xs"
                      >
                        {t('catalog.products.viewDetail')}
                        <ArrowRight className="size-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Product Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>{t('catalog.products.createTitle')}</DialogTitle>
              <DialogDescription>
                {t('catalog.products.createSubtitle')}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              {createError && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{createError}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="create-code">
                  {t('catalog.products.fieldCode')} *
                </Label>
                <Input
                  id="create-code"
                  placeholder="e.g. tool-ai-writer"
                  value={createCode}
                  onChange={(e) => setCreateCode(e.target.value)}
                  disabled={createLoading}
                  required
                />
                <span className="text-[11px] text-muted-foreground">
                  {t('catalog.products.fieldCodeHelp')}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="create-name">
                  {t('catalog.products.fieldName')} *
                </Label>
                <Input
                  id="create-name"
                  placeholder="e.g. AI Writer Service"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  disabled={createLoading}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="create-desc">
                  {t('catalog.products.fieldDescription')}
                </Label>
                <Textarea
                  id="create-desc"
                  placeholder="Optional description"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  disabled={createLoading}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={createLoading}
              >
                {t('common.actions.cancel')}
              </Button>
              <Button type="submit" disabled={createLoading}>
                {createLoading && <Spinner className="size-4 mr-2" />}
                {t('common.actions.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
