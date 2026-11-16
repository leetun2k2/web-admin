import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit2,
  Lock,
  Plus,
  Power,
  PowerOff,
  Sliders,
  Tag,
  Trash2,
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
  type AnchorType,
  type BillingCycle,
  type OfferItem,
  type OfferType,
  type PlanItem,
  type PriceItem,
  type ProductItem,
  type QuotaRuleItem,
} from '@/services';

export const PlanDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { productId, planId } = useParams<{
    productId: string;
    planId: string;
  }>();

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [plan, setPlan] = useState<PlanItem | null>(null);
  const [quotas, setQuotas] = useState<QuotaRuleItem[]>([]);
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [pricesByOffer, setPricesByOffer] = useState<
    Record<string, PriceItem[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Plan Dialog
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanDesc, setEditPlanDesc] = useState('');
  const [editPlanLoading, setEditPlanLoading] = useState(false);
  const [editPlanError, setEditPlanError] = useState<string | null>(null);

  // Activation / Deactivation Confirmation Dialog
  const [confirmAction, setConfirmAction] = useState<
    'activate' | 'deactivate' | null
  >(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Quota Dialogs
  const [createQuotaOpen, setCreateQuotaOpen] = useState(false);
  const [quotaRuleKey, setQuotaRuleKey] = useState('');
  const [quotaLimit, setQuotaLimit] = useState('');
  const [quotaWindow, setQuotaWindow] = useState('3600');
  const [quotaAnchor, setQuotaAnchor] = useState<AnchorType>('FIRST_USE');
  const [createQuotaLoading, setCreateQuotaLoading] = useState(false);
  const [createQuotaError, setCreateQuotaError] = useState<string | null>(null);

  const [editQuotaTarget, setEditQuotaTarget] = useState<QuotaRuleItem | null>(
    null,
  );
  const [editQuotaLimit, setEditQuotaLimit] = useState('');
  const [editQuotaWindow, setEditQuotaWindow] = useState('');
  const [editQuotaLoading, setEditQuotaLoading] = useState(false);
  const [editQuotaError, setEditQuotaError] = useState<string | null>(null);

  const [deleteQuotaTarget, setDeleteQuotaTarget] =
    useState<QuotaRuleItem | null>(null);
  const [deleteQuotaLoading, setDeleteQuotaLoading] = useState(false);
  const [deleteQuotaError, setDeleteQuotaError] = useState<string | null>(null);

  // Offer Dialogs
  const [createOfferOpen, setCreateOfferOpen] = useState(false);
  const [offerCode, setOfferCode] = useState('');
  const [offerType, setOfferType] = useState<OfferType>('paid');
  const [offerBillingCycle, setOfferBillingCycle] =
    useState<BillingCycle>('monthly');
  const [offerSortOrder, setOfferSortOrder] = useState('0');
  const [createOfferLoading, setCreateOfferLoading] = useState(false);
  const [createOfferError, setCreateOfferError] = useState<string | null>(null);

  // Price Dialog
  const [createPriceOfferId, setCreatePriceOfferId] = useState<string | null>(
    null,
  );
  const [priceCurrency, setPriceCurrency] = useState('USD');
  const [priceAmount, setPriceAmount] = useState('1000');
  const [createPriceLoading, setCreatePriceLoading] = useState(false);
  const [createPriceError, setCreatePriceError] = useState<string | null>(null);

  const isImmutable = Boolean(plan?.activated_at) || plan?.status !== 'draft';

  const fetchData = async () => {
    if (!productId || !planId) return;
    setLoading(true);
    setError(null);
    try {
      const [prodData, planData, quotaList, offerList] = await Promise.all([
        productService.getProduct(productId),
        productService.getPlan(planId),
        productService.listQuotaRulesByPlan(planId),
        productService.listOffersByPlan(planId),
      ]);
      setProduct(prodData);
      setPlan(planData);
      setQuotas(quotaList);
      setOffers(offerList);

      // Load prices for each offer
      const priceMap: Record<string, PriceItem[]> = {};
      await Promise.all(
        offerList.map(async (off) => {
          try {
            const pList = await productService.listPricesByOffer(off.id);
            priceMap[off.id] = pList;
          } catch {
            priceMap[off.id] = [];
          }
        }),
      );
      setPricesByOffer(priceMap);
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
  }, [productId, planId]);

  // Plan actions
  const handleEditPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId) return;
    setEditPlanLoading(true);
    setEditPlanError(null);
    try {
      const updated = await productService.updatePlan(planId, {
        name: editPlanName.trim() || undefined,
        description: editPlanDesc.trim() ? editPlanDesc.trim() : null,
      });
      setPlan(updated);
      setEditPlanOpen(false);
    } catch (err) {
      setEditPlanError(
        getApiErrorMessage(err, t('catalog.errors.plan_immutable')),
      );
    } finally {
      setEditPlanLoading(false);
    }
  };

  const handleTogglePlanStatus = async () => {
    if (!planId || !confirmAction) return;
    setActionLoading(true);
    setActionError(null);
    try {
      if (confirmAction === 'activate') {
        const updated = await productService.activatePlan(planId);
        setPlan(updated);
      } else {
        const updated = await productService.deactivatePlan(planId);
        setPlan(updated);
      }
      setConfirmAction(null);
      void fetchData(); // refresh read model and catalog visibility
    } catch (err) {
      setActionError(
        getApiErrorMessage(err, t('catalog.errors.invalid_plan_activation')),
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Quota actions
  const handleCreateQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId) return;
    const limitNum = Number(quotaLimit.trim());
    const windowNum = Number(quotaWindow.trim());
    if (
      !quotaRuleKey.trim() ||
      !Number.isSafeInteger(limitNum) ||
      limitNum <= 0 ||
      !Number.isSafeInteger(windowNum) ||
      windowNum <= 0
    ) {
      setCreateQuotaError(t('catalog.errors.invalid_request'));
      return;
    }

    setCreateQuotaLoading(true);
    setCreateQuotaError(null);
    try {
      const created = await productService.createQuotaRule(planId, {
        rule_key: quotaRuleKey.trim(),
        limit_amount: limitNum,
        window_duration_seconds: windowNum,
        anchor_type: quotaAnchor,
      });
      setQuotas((prev) => [...prev, created]);
      setCreateQuotaOpen(false);
      setQuotaRuleKey('');
      setQuotaLimit('');
    } catch (err) {
      setCreateQuotaError(
        getApiErrorMessage(err, t('catalog.errors.conflict')),
      );
    } finally {
      setCreateQuotaLoading(false);
    }
  };

  const handleUpdateQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editQuotaTarget) return;
    const limitNum = Number(editQuotaLimit.trim());
    const windowNum = Number(editQuotaWindow.trim());
    if (
      !Number.isSafeInteger(limitNum) ||
      limitNum <= 0 ||
      !Number.isSafeInteger(windowNum) ||
      windowNum <= 0
    ) {
      setEditQuotaError(t('catalog.errors.invalid_request'));
      return;
    }

    setEditQuotaLoading(true);
    setEditQuotaError(null);
    try {
      const updated = await productService.updateQuotaRule(editQuotaTarget.id, {
        limit_amount: limitNum,
        window_duration_seconds: windowNum,
      });
      setQuotas((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      setEditQuotaTarget(null);
    } catch (err) {
      setEditQuotaError(
        getApiErrorMessage(err, t('catalog.errors.plan_immutable')),
      );
    } finally {
      setEditQuotaLoading(false);
    }
  };

  const handleDeleteQuota = async () => {
    if (!deleteQuotaTarget) return;
    setDeleteQuotaLoading(true);
    setDeleteQuotaError(null);
    try {
      await productService.deleteQuotaRule(deleteQuotaTarget.id);
      setQuotas((prev) => prev.filter((q) => q.id !== deleteQuotaTarget.id));
      setDeleteQuotaTarget(null);
    } catch (err) {
      setDeleteQuotaError(
        getApiErrorMessage(err, t('catalog.errors.plan_immutable')),
      );
    } finally {
      setDeleteQuotaLoading(false);
    }
  };

  // Offer & Price actions
  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId) return;
    const sortNum = parseInt(offerSortOrder, 10);
    if (!offerCode.trim() || isNaN(sortNum)) {
      setCreateOfferError(t('catalog.errors.invalid_request'));
      return;
    }

    setCreateOfferLoading(true);
    setCreateOfferError(null);
    try {
      const created = await productService.createOffer(planId, {
        code: offerCode.trim(),
        offer_type: offerType,
        billing_cycle: offerBillingCycle,
        sort_order: sortNum,
      });
      setOffers((prev) => [...prev, created]);
      setPricesByOffer((prev) => ({ ...prev, [created.id]: [] }));
      setCreateOfferOpen(false);
      setOfferCode('');
      setOfferSortOrder('0');
    } catch (err) {
      setCreateOfferError(
        getApiErrorMessage(err, t('catalog.errors.conflict')),
      );
    } finally {
      setCreateOfferLoading(false);
    }
  };

  const handleToggleOfferStatus = async (offer: OfferItem) => {
    try {
      let updated: OfferItem;
      if (offer.status === 'active') {
        updated = await productService.deactivateOffer(offer.id);
      } else {
        updated = await productService.activateOffer(offer.id);
      }
      setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      void fetchData(); // refresh prices catalog_visible status
    } catch (err) {
      alert(getApiErrorMessage(err, t('catalog.errors.service_unavailable')));
    }
  };

  const handleUpsertPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createPriceOfferId) return;
    const amtNum = Number(priceAmount.trim());
    if (!priceCurrency.trim() || !Number.isSafeInteger(amtNum) || amtNum < 0) {
      setCreatePriceError(t('catalog.errors.invalid_request'));
      return;
    }

    setCreatePriceLoading(true);
    setCreatePriceError(null);
    try {
      const upserted = await productService.upsertPrice(createPriceOfferId, {
        currency: priceCurrency.trim().toUpperCase(),
        amount: amtNum,
        status: 'active',
      });
      setPricesByOffer((prev) => {
        const existing = prev[createPriceOfferId] || [];
        const index = existing.findIndex(
          (p) => p.currency === upserted.currency,
        );
        if (index >= 0) {
          const next = [...existing];
          next[index] = upserted;
          return { ...prev, [createPriceOfferId]: next };
        }
        return { ...prev, [createPriceOfferId]: [...existing, upserted] };
      });
      setCreatePriceOfferId(null);
      setPriceAmount('1000');
    } catch (err) {
      setCreatePriceError(
        getApiErrorMessage(err, t('catalog.errors.conflict')),
      );
    } finally {
      setCreatePriceLoading(false);
    }
  };

  const handleTogglePriceStatus = async (offerId: string, price: PriceItem) => {
    const newStatus = price.status === 'active' ? 'inactive' : 'active';
    try {
      const updated = await productService.updatePriceStatus(price.id, {
        status: newStatus,
      });
      setPricesByOffer((prev) => {
        const current = prev[offerId] || [];
        return {
          ...prev,
          [offerId]: current.map((p) => (p.id === updated.id ? updated : p)),
        };
      });
    } catch (err) {
      alert(getApiErrorMessage(err, t('catalog.errors.service_unavailable')));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (error || !product || !plan) {
    return (
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/app/products/${productId}`)}
          className="w-fit gap-2"
        >
          <ArrowLeft className="size-4" />
          Back to Product
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{t('common.errors.unexpected')}</AlertTitle>
          <AlertDescription>
            {error || t('catalog.errors.not_found')}
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
            onClick={() => navigate(`/app/products/${productId}`)}
            title="Back to product"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {product.name} /
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {plan.name}
              </h1>
              <Badge variant="outline" className="font-mono text-xs">
                v{plan.version}
              </Badge>
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
            </div>
            <p className="font-mono text-xs text-muted-foreground mt-0.5">
              Code: {plan.code} &bull; ID: {plan.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isImmutable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditPlanName(plan.name);
                setEditPlanDesc(plan.description || '');
                setEditPlanError(null);
                setEditPlanOpen(true);
              }}
              className="gap-2"
            >
              <Edit2 className="size-3.5" />
              {t('common.actions.save')}
            </Button>
          )}

          {plan.status === 'draft' && (
            <Button
              size="sm"
              onClick={() => {
                setActionError(null);
                setConfirmAction('activate');
              }}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Power className="size-3.5" />
              {t('catalog.plans.activate')}
            </Button>
          )}

          {plan.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActionError(null);
                setConfirmAction('deactivate');
              }}
              className="gap-2 text-destructive hover:bg-destructive/10"
            >
              <PowerOff className="size-3.5" />
              {t('catalog.plans.deactivate')}
            </Button>
          )}
        </div>
      </div>

      {/* Plan Immutability Notice */}
      {isImmutable && (
        <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
          <Lock className="size-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="font-semibold text-xs">
            Plan Entitlements Immutable
          </AlertTitle>
          <AlertDescription className="text-xs">
            {t('catalog.plans.immutableNotice')}
          </AlertDescription>
        </Alert>
      )}

      {/* Plan Info Card */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-2">
          <CardTitle className="text-base font-semibold">
            {t('catalog.products.fieldDescription')}
          </CardTitle>
          <CardDescription>
            {plan.description || 'No description provided for this plan.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-2 text-xs text-muted-foreground flex flex-wrap gap-x-6 gap-y-1">
          <span>
            First Activated:{' '}
            {plan.activated_at
              ? new Date(plan.activated_at).toLocaleString()
              : 'Never'}
          </span>
          <span>Created: {new Date(plan.created_at).toLocaleString()}</span>
          <span>Updated: {new Date(plan.updated_at).toLocaleString()}</span>
        </CardContent>
      </Card>

      {/* SECTION 1: Quota Rules & Entitlements */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="size-4 text-primary" />
                <CardTitle className="text-base font-semibold">
                  {t('catalog.quotas.title')} ({quotas.length})
                </CardTitle>
              </div>
              <CardDescription>{t('catalog.quotas.subtitle')}</CardDescription>
            </div>
            {!isImmutable && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setCreateQuotaError(null);
                  setCreateQuotaOpen(true);
                }}
                className="gap-2"
              >
                <Plus className="size-3.5" />
                {t('catalog.quotas.createButton')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {quotas.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-muted-foreground">
              <Clock className="size-8 text-muted-foreground/40 mb-2" />
              {t('catalog.quotas.empty')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('catalog.quotas.colRuleKey')}</TableHead>
                  <TableHead>{t('catalog.quotas.colLimit')}</TableHead>
                  <TableHead>{t('catalog.quotas.colWindow')}</TableHead>
                  <TableHead>{t('catalog.quotas.colAnchor')}</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotas.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-mono text-xs font-semibold">
                      {q.rule_key}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {q.limit_amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {q.window_duration_seconds}s (
                      {Math.round(q.window_duration_seconds / 3600)}h)
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="text-[11px] font-mono"
                      >
                        {q.anchor_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!isImmutable && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditQuotaTarget(q);
                              setEditQuotaLimit(String(q.limit_amount));
                              setEditQuotaWindow(
                                String(q.window_duration_seconds),
                              );
                              setEditQuotaError(null);
                            }}
                            className="size-7"
                            title="Edit quota"
                          >
                            <Edit2 className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeleteQuotaTarget(q);
                              setDeleteQuotaError(null);
                            }}
                            className="size-7 text-destructive hover:bg-destructive/10"
                            title="Delete quota"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* SECTION 2: Commercial Offers & Currency Prices */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Tag className="size-4 text-primary" />
                <CardTitle className="text-base font-semibold">
                  {t('catalog.offers.title')} ({offers.length})
                </CardTitle>
              </div>
              <CardDescription>{t('catalog.offers.subtitle')}</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setCreateOfferError(null);
                setCreateOfferOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="size-3.5" />
              {t('catalog.offers.createButton')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 p-4 sm:p-6">
          {offers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-muted-foreground">
              <DollarSign className="size-8 text-muted-foreground/40 mb-2" />
              {t('catalog.offers.empty')}
            </div>
          ) : (
            offers.map((offer) => {
              const prices = pricesByOffer[offer.id] || [];
              return (
                <div
                  key={offer.id}
                  className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3 shadow-xs"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold">
                            {offer.code}
                          </span>
                          <Badge
                            variant={
                              offer.offer_type === 'free'
                                ? 'secondary'
                                : 'default'
                            }
                            className="capitalize text-xs"
                          >
                            {offer.offer_type}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="capitalize text-xs"
                          >
                            {offer.billing_cycle}
                          </Badge>
                          <Badge
                            variant={
                              offer.status === 'active'
                                ? 'default'
                                : 'secondary'
                            }
                            className="capitalize text-xs"
                          >
                            {offer.status}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          Order: {offer.sort_order} &bull; ID: {offer.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCreatePriceOfferId(offer.id);
                          setPriceCurrency('USD');
                          setPriceAmount(
                            offer.offer_type === 'free' ? '0' : '1000',
                          );
                          setCreatePriceError(null);
                        }}
                        className="gap-1.5 h-8 text-xs"
                      >
                        <Plus className="size-3.5" />
                        {t('catalog.prices.createButton')}
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          offer.status === 'active' ? 'outline' : 'default'
                        }
                        onClick={() => handleToggleOfferStatus(offer)}
                        className={`h-8 text-xs ${
                          offer.status === 'active'
                            ? 'text-destructive hover:bg-destructive/10'
                            : ''
                        }`}
                      >
                        {offer.status === 'active'
                          ? t('catalog.offers.deactivate')
                          : t('catalog.offers.activate')}
                      </Button>
                    </div>
                  </div>

                  {/* Prices Sub-table */}
                  <div className="mt-2 rounded-md border border-border/60 bg-muted/20">
                    <div className="px-3 py-1.5 border-b border-border/40 text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                      <span>
                        {t('catalog.prices.title')} ({prices.length})
                      </span>
                      <span className="text-[10px] font-normal italic">
                        Amounts in minor units (e.g. 1000 = 10.00)
                      </span>
                    </div>
                    {prices.length === 0 ? (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        {t('catalog.prices.empty')}
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="text-xs">
                            <TableHead className="h-8">
                              {t('catalog.prices.colCurrency')}
                            </TableHead>
                            <TableHead className="h-8">
                              {t('catalog.prices.colAmount')}
                            </TableHead>
                            <TableHead className="h-8">
                              {t('catalog.prices.colStatus')}
                            </TableHead>
                            <TableHead className="h-8">
                              {t('catalog.prices.colVisible')}
                            </TableHead>
                            <TableHead className="h-8 text-right">
                              <span className="sr-only">Toggle</span>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {prices.map((p) => (
                            <TableRow key={p.id} className="text-xs">
                              <TableCell className="font-mono font-bold">
                                {p.currency}
                              </TableCell>
                              <TableCell className="font-mono">
                                {p.amount.toLocaleString()} (
                                {(p.amount / 100).toFixed(2)})
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    p.status === 'active'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                  className="text-[10px] capitalize"
                                >
                                  {p.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {p.catalog_visible ? (
                                  <Badge className="bg-emerald-600 text-white text-[10px] gap-1">
                                    <CheckCircle2 className="size-2.5" />
                                    Visible
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] text-muted-foreground"
                                  >
                                    Hidden
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleTogglePriceStatus(offer.id, p)
                                  }
                                  className="h-7 text-[11px]"
                                >
                                  {p.status === 'active'
                                    ? t('catalog.prices.toggleInactive')
                                    : t('catalog.prices.toggleActive')}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Edit Plan Dialog */}
      <Dialog open={editPlanOpen} onOpenChange={setEditPlanOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleEditPlan}>
            <DialogHeader>
              <DialogTitle>{t('catalog.plans.editTitle')}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              {editPlanError && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{editPlanError}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="plan-edit-name">
                  {t('catalog.plans.fieldName')}
                </Label>
                <Input
                  id="plan-edit-name"
                  value={editPlanName}
                  onChange={(e) => setEditPlanName(e.target.value)}
                  disabled={editPlanLoading}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="plan-edit-desc">
                  {t('catalog.products.fieldDescription')}
                </Label>
                <Textarea
                  id="plan-edit-desc"
                  value={editPlanDesc}
                  onChange={(e) => setEditPlanDesc(e.target.value)}
                  disabled={editPlanLoading}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditPlanOpen(false)}
                disabled={editPlanLoading}
              >
                {t('common.actions.cancel')}
              </Button>
              <Button type="submit" disabled={editPlanLoading}>
                {editPlanLoading && <Spinner className="size-4 mr-2" />}
                {t('common.actions.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Activate / Deactivate Confirmation Dialog */}
      <Dialog
        open={Boolean(confirmAction)}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'activate'
                ? t('catalog.plans.activate')
                : t('catalog.plans.deactivate')}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'activate'
                ? t('catalog.plans.activateConfirm')
                : t('catalog.plans.deactivateConfirm')}
            </DialogDescription>
          </DialogHeader>

          {actionError && (
            <Alert variant="destructive" className="my-2">
              <AlertCircle className="size-4" />
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmAction(null)}
              disabled={actionLoading}
            >
              {t('common.actions.cancel')}
            </Button>
            <Button
              variant={confirmAction === 'activate' ? 'default' : 'destructive'}
              onClick={handleTogglePlanStatus}
              disabled={actionLoading}
            >
              {actionLoading && <Spinner className="size-4 mr-2" />}
              {confirmAction === 'activate'
                ? 'Confirm Activation'
                : 'Confirm Deactivation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Quota Rule Dialog */}
      <Dialog open={createQuotaOpen} onOpenChange={setCreateQuotaOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateQuota}>
            <DialogHeader>
              <DialogTitle>{t('catalog.quotas.createTitle')}</DialogTitle>
              <DialogDescription>
                {t('catalog.quotas.draftOnlyHelp')}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              {createQuotaError && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{createQuotaError}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="q-rule-key">
                  {t('catalog.quotas.fieldRuleKey')} *
                </Label>
                <Input
                  id="q-rule-key"
                  placeholder="e.g. requests, tokens, storage_gb"
                  value={quotaRuleKey}
                  onChange={(e) => setQuotaRuleKey(e.target.value)}
                  disabled={createQuotaLoading}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="q-limit">
                  {t('catalog.quotas.fieldLimitAmount')} *
                </Label>
                <Input
                  id="q-limit"
                  type="number"
                  min="1"
                  placeholder="e.g. 1000"
                  value={quotaLimit}
                  onChange={(e) => setQuotaLimit(e.target.value)}
                  disabled={createQuotaLoading}
                  required
                />
                <span className="text-[11px] text-muted-foreground">
                  {t('catalog.quotas.fieldLimitAmountHelp')}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="q-window">
                  {t('catalog.quotas.fieldWindowDuration')} *
                </Label>
                <Input
                  id="q-window"
                  type="number"
                  min="1"
                  placeholder="e.g. 3600 (1 hour)"
                  value={quotaWindow}
                  onChange={(e) => setQuotaWindow(e.target.value)}
                  disabled={createQuotaLoading}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="q-anchor">
                  {t('catalog.quotas.fieldAnchorType')} *
                </Label>
                <NativeSelect
                  id="q-anchor"
                  value={quotaAnchor}
                  onChange={(e) => setQuotaAnchor(e.target.value as AnchorType)}
                  disabled={createQuotaLoading}
                >
                  <NativeSelectOption value="FIRST_USE">
                    {t('catalog.quotas.anchorFirstUse')}
                  </NativeSelectOption>
                  <NativeSelectOption value="SUBSCRIPTION_DATE">
                    {t('catalog.quotas.anchorSubscriptionDate')}
                  </NativeSelectOption>
                </NativeSelect>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateQuotaOpen(false)}
                disabled={createQuotaLoading}
              >
                {t('common.actions.cancel')}
              </Button>
              <Button type="submit" disabled={createQuotaLoading}>
                {createQuotaLoading && <Spinner className="size-4 mr-2" />}
                {t('common.actions.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Quota Rule Dialog */}
      <Dialog
        open={Boolean(editQuotaTarget)}
        onOpenChange={(open) => {
          if (!open) setEditQuotaTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUpdateQuota}>
            <DialogHeader>
              <DialogTitle>{t('catalog.quotas.editTitle')}</DialogTitle>
              <DialogDescription>
                Rule Key:{' '}
                <code className="font-bold">{editQuotaTarget?.rule_key}</code>
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              {editQuotaError && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{editQuotaError}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-q-limit">
                  {t('catalog.quotas.fieldLimitAmount')} *
                </Label>
                <Input
                  id="edit-q-limit"
                  type="number"
                  min="1"
                  value={editQuotaLimit}
                  onChange={(e) => setEditQuotaLimit(e.target.value)}
                  disabled={editQuotaLoading}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-q-window">
                  {t('catalog.quotas.fieldWindowDuration')} *
                </Label>
                <Input
                  id="edit-q-window"
                  type="number"
                  min="1"
                  value={editQuotaWindow}
                  onChange={(e) => setEditQuotaWindow(e.target.value)}
                  disabled={editQuotaLoading}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditQuotaTarget(null)}
                disabled={editQuotaLoading}
              >
                {t('common.actions.cancel')}
              </Button>
              <Button type="submit" disabled={editQuotaLoading}>
                {editQuotaLoading && <Spinner className="size-4 mr-2" />}
                {t('common.actions.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Quota Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteQuotaTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteQuotaTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('catalog.quotas.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('catalog.quotas.deleteConfirm')} (Rule:{' '}
              {deleteQuotaTarget?.rule_key})
            </DialogDescription>
          </DialogHeader>

          {deleteQuotaError && (
            <Alert variant="destructive" className="my-2">
              <AlertCircle className="size-4" />
              <AlertDescription>{deleteQuotaError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteQuotaTarget(null)}
              disabled={deleteQuotaLoading}
            >
              {t('common.actions.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteQuota}
              disabled={deleteQuotaLoading}
            >
              {deleteQuotaLoading && <Spinner className="size-4 mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Offer Dialog */}
      <Dialog open={createOfferOpen} onOpenChange={setCreateOfferOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateOffer}>
            <DialogHeader>
              <DialogTitle>{t('catalog.offers.createTitle')}</DialogTitle>
              <DialogDescription>
                {t('catalog.offers.subtitle')}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              {createOfferError && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{createOfferError}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="off-code">
                  {t('catalog.offers.fieldCode')} *
                </Label>
                <Input
                  id="off-code"
                  placeholder="e.g. pro-monthly, free-tier"
                  value={offerCode}
                  onChange={(e) => setOfferCode(e.target.value)}
                  disabled={createOfferLoading}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="off-type">
                  {t('catalog.offers.fieldType')} *
                </Label>
                <NativeSelect
                  id="off-type"
                  value={offerType}
                  onChange={(e) => {
                    const val = e.target.value as OfferType;
                    setOfferType(val);
                    if (val === 'free') {
                      setOfferBillingCycle('lifetime');
                    }
                  }}
                  disabled={createOfferLoading}
                >
                  <NativeSelectOption value="paid">
                    {t('catalog.offers.typePaid')}
                  </NativeSelectOption>
                  <NativeSelectOption value="free">
                    {t('catalog.offers.typeFree')}
                  </NativeSelectOption>
                </NativeSelect>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="off-cycle">
                  {t('catalog.offers.fieldCycle')} *
                </Label>
                <NativeSelect
                  id="off-cycle"
                  value={offerBillingCycle}
                  onChange={(e) =>
                    setOfferBillingCycle(e.target.value as BillingCycle)
                  }
                  disabled={createOfferLoading || offerType === 'free'}
                >
                  {offerType === 'free' ? (
                    <NativeSelectOption value="lifetime">
                      {t('catalog.offers.cycleLifetime')} (Required for free)
                    </NativeSelectOption>
                  ) : (
                    <>
                      <NativeSelectOption value="monthly">
                        {t('catalog.offers.cycleMonthly')}
                      </NativeSelectOption>
                      <NativeSelectOption value="yearly">
                        {t('catalog.offers.cycleYearly')}
                      </NativeSelectOption>
                      <NativeSelectOption value="lifetime">
                        {t('catalog.offers.cycleLifetime')}
                      </NativeSelectOption>
                      <NativeSelectOption value="one_off">
                        {t('catalog.offers.cycleOneOff')}
                      </NativeSelectOption>
                    </>
                  )}
                </NativeSelect>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="off-sort">
                  {t('catalog.offers.fieldSortOrder')}
                </Label>
                <Input
                  id="off-sort"
                  type="number"
                  value={offerSortOrder}
                  onChange={(e) => setOfferSortOrder(e.target.value)}
                  disabled={createOfferLoading}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOfferOpen(false)}
                disabled={createOfferLoading}
              >
                {t('common.actions.cancel')}
              </Button>
              <Button type="submit" disabled={createOfferLoading}>
                {createOfferLoading && <Spinner className="size-4 mr-2" />}
                {t('common.actions.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Price Dialog */}
      <Dialog
        open={Boolean(createPriceOfferId)}
        onOpenChange={(open) => {
          if (!open) setCreatePriceOfferId(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUpsertPrice}>
            <DialogHeader>
              <DialogTitle>{t('catalog.prices.createTitle')}</DialogTitle>
              <DialogDescription>
                {t('catalog.prices.subtitle')}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              {createPriceError && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{createPriceError}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="pr-currency">
                  {t('catalog.prices.fieldCurrency')} *
                </Label>
                <Input
                  id="pr-currency"
                  placeholder="e.g. USD, EUR, VND"
                  value={priceCurrency}
                  onChange={(e) =>
                    setPriceCurrency(e.target.value.toUpperCase())
                  }
                  disabled={createPriceLoading}
                  maxLength={3}
                  required
                />
                <span className="text-[11px] text-muted-foreground">
                  {t('catalog.prices.fieldCurrencyHelp')}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="pr-amount">
                  {t('catalog.prices.fieldAmount')} *
                </Label>
                <Input
                  id="pr-amount"
                  type="number"
                  min="0"
                  placeholder="e.g. 1000 for $10.00; 0 for free"
                  value={priceAmount}
                  onChange={(e) => setPriceAmount(e.target.value)}
                  disabled={createPriceLoading}
                  required
                />
                <span className="text-[11px] text-muted-foreground">
                  {t('catalog.prices.fieldAmountHelp')}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreatePriceOfferId(null)}
                disabled={createPriceLoading}
              >
                {t('common.actions.cancel')}
              </Button>
              <Button type="submit" disabled={createPriceLoading}>
                {createPriceLoading && <Spinner className="size-4 mr-2" />}
                {t('common.actions.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
