import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Edit2,
  Layers,
  Plus,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import {
  getApiErrorMessage,
  productService,
  type PlanItem,
  type ProductItem,
  type ProductStatus,
} from '@/services';

export const ProductDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Product Dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState<ProductStatus>('active');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Create Plan Dialog
  const [createPlanOpen, setCreatePlanOpen] = useState(false);
  const [planCode, setPlanCode] = useState('');
  const [planName, setPlanName] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [planVersion, setPlanVersion] = useState('1');
  const [createPlanLoading, setCreatePlanLoading] = useState(false);
  const [createPlanError, setCreatePlanError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const [prod, planList] = await Promise.all([
        productService.getProduct(productId),
        productService.listPlansByProduct(productId),
      ]);
      setProduct(prod);
      setPlans(planList);
    } catch (err) {
      setError(
        getApiErrorMessage(err, t('catalog.errors.service_unavailable')),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [productId]);

  const openEdit = () => {
    if (!product) return;
    setEditName(product.name);
    setEditDesc(product.description || '');
    setEditStatus(product.status);
    setEditError(null);
    setEditOpen(true);
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !product) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const updated = await productService.updateProduct(productId, {
        name: editName.trim() || undefined,
        description: editDesc.trim() ? editDesc.trim() : null,
        status: editStatus,
      });
      setProduct(updated);
      setEditOpen(false);
    } catch (err) {
      setEditError(getApiErrorMessage(err, t('catalog.errors.conflict')));
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    const versionNum = parseInt(planVersion, 10);
    if (
      !planCode.trim() ||
      !planName.trim() ||
      isNaN(versionNum) ||
      versionNum < 1
    ) {
      setCreatePlanError(t('catalog.errors.invalid_request'));
      return;
    }

    setCreatePlanLoading(true);
    setCreatePlanError(null);
    try {
      const created = await productService.createPlan(productId, {
        code: planCode.trim(),
        name: planName.trim(),
        description: planDesc.trim() || undefined,
        version: versionNum,
      });
      setCreatePlanOpen(false);
      setPlanCode('');
      setPlanName('');
      setPlanDesc('');
      setPlanVersion('1');
      setPlans((prev) => [created, ...prev]);
      navigate(`/app/products/${productId}/plans/${created.id}`);
    } catch (err) {
      setCreatePlanError(getApiErrorMessage(err, t('catalog.errors.conflict')));
    } finally {
      setCreatePlanLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/app/products')}
          className="w-fit gap-2"
        >
          <ArrowLeft className="size-4" />
          {t('catalog.products.title')}
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{t('common.errors.unexpected')}</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error || t('catalog.errors.not_found')}</span>
            <Button variant="outline" size="sm" onClick={fetchData}>
              {t('common.actions.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/app/products')}
            title="Back to products"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {product.name}
              </h1>
              <Badge
                variant={product.status === 'active' ? 'default' : 'secondary'}
                className="capitalize text-xs"
              >
                {product.status}
              </Badge>
            </div>
            <p className="font-mono text-xs text-muted-foreground mt-0.5">
              Code: {product.code} &bull; ID: {product.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openEdit}
            className="gap-2"
          >
            <Edit2 className="size-3.5" />
            {t('common.actions.save')}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setCreatePlanError(null);
              setCreatePlanOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="size-3.5" />
            {t('catalog.plans.createButton')}
          </Button>
        </div>
      </div>

      {/* Product Overview Card */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-2">
          <CardTitle className="text-base font-semibold">
            {t('catalog.products.fieldDescription')}
          </CardTitle>
          <CardDescription>
            {product.description || 'No description provided.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-2 text-xs text-muted-foreground flex flex-wrap gap-x-6 gap-y-1">
          <span>Created: {new Date(product.created_at).toLocaleString()}</span>
          <span>Updated: {new Date(product.updated_at).toLocaleString()}</span>
        </CardContent>
      </Card>

      {/* Plans Section */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                {t('catalog.plans.title')} ({plans.length})
              </CardTitle>
              <CardDescription>
                Plans configure entitlements, versioning, quotas, and packaging.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Layers className="size-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                {t('catalog.plans.empty')}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreatePlanOpen(true)}
                className="gap-2"
              >
                <Plus className="size-4" />
                {t('catalog.plans.createButton')}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('catalog.plans.colCode')}</TableHead>
                  <TableHead>{t('catalog.plans.colName')}</TableHead>
                  <TableHead>{t('catalog.plans.colVersion')}</TableHead>
                  <TableHead>{t('catalog.plans.colStatus')}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t('catalog.plans.colActivatedAt')}
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    {t('catalog.plans.colCreatedAt')}
                  </TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow
                    key={plan.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() =>
                      navigate(`/app/products/${productId}/plans/${plan.id}`)
                    }
                  >
                    <TableCell className="font-mono text-xs font-semibold">
                      {plan.code}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {plan.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        v{plan.version}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          plan.status === 'active'
                            ? 'default'
                            : plan.status === 'draft'
                              ? 'secondary'
                              : 'destructive'
                        }
                        className="capitalize text-xs"
                      >
                        {plan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {plan.activated_at
                        ? new Date(plan.activated_at).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                      {new Date(plan.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/app/products/${productId}/plans/${plan.id}`,
                          );
                        }}
                        className="gap-1 text-xs"
                      >
                        Manage
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

      {/* Edit Product Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleEditProduct}>
            <DialogHeader>
              <DialogTitle>{t('catalog.products.editTitle')}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              {editError && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{editError}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-name">
                  {t('catalog.products.fieldName')}
                </Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={editLoading}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-desc">
                  {t('catalog.products.fieldDescription')}
                </Label>
                <Textarea
                  id="edit-desc"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  disabled={editLoading}
                  rows={3}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-status">
                  {t('catalog.products.fieldStatus')}
                </Label>
                <NativeSelect
                  id="edit-status"
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as ProductStatus)
                  }
                  disabled={editLoading}
                >
                  <NativeSelectOption value="active">
                    {t('catalog.products.active')}
                  </NativeSelectOption>
                  <NativeSelectOption value="inactive">
                    {t('catalog.products.inactive')}
                  </NativeSelectOption>
                </NativeSelect>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={editLoading}
              >
                {t('common.actions.cancel')}
              </Button>
              <Button type="submit" disabled={editLoading}>
                {editLoading && <Spinner className="size-4 mr-2" />}
                {t('common.actions.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Plan Dialog */}
      <Dialog open={createPlanOpen} onOpenChange={setCreatePlanOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreatePlan}>
            <DialogHeader>
              <DialogTitle>{t('catalog.plans.createTitle')}</DialogTitle>
              <DialogDescription>
                {t('catalog.plans.createSubtitle')}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              {createPlanError && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{createPlanError}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="plan-code">
                  {t('catalog.plans.fieldCode')} *
                </Label>
                <Input
                  id="plan-code"
                  placeholder="e.g. pro, free, growth"
                  value={planCode}
                  onChange={(e) => setPlanCode(e.target.value)}
                  disabled={createPlanLoading}
                  required
                />
                <span className="text-[11px] text-muted-foreground">
                  {t('catalog.plans.fieldCodeHelp')}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="plan-name">
                  {t('catalog.plans.fieldName')} *
                </Label>
                <Input
                  id="plan-name"
                  placeholder="e.g. Professional Plan"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  disabled={createPlanLoading}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="plan-version">
                  {t('catalog.plans.fieldVersion')}
                </Label>
                <Input
                  id="plan-version"
                  type="number"
                  min="1"
                  value={planVersion}
                  onChange={(e) => setPlanVersion(e.target.value)}
                  disabled={createPlanLoading}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="plan-desc">
                  {t('catalog.products.fieldDescription')}
                </Label>
                <Textarea
                  id="plan-desc"
                  placeholder="Optional plan description"
                  value={planDesc}
                  onChange={(e) => setPlanDesc(e.target.value)}
                  disabled={createPlanLoading}
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreatePlanOpen(false)}
                disabled={createPlanLoading}
              >
                {t('common.actions.cancel')}
              </Button>
              <Button type="submit" disabled={createPlanLoading}>
                {createPlanLoading && <Spinner className="size-4 mr-2" />}
                {t('common.actions.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
