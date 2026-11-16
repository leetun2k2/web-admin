import { authedClient } from '@/lib/http';

export type ProductStatus = 'active' | 'inactive';
export type PlanStatus = 'draft' | 'active' | 'inactive';
export type OfferType = 'free' | 'paid';
export type BillingCycle = 'monthly' | 'yearly' | 'lifetime' | 'one_off';
export type PriceStatus = 'active' | 'inactive';
export type AnchorType = 'FIRST_USE' | 'SUBSCRIPTION_DATE';

export interface ProductItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface PlanItem {
  id: string;
  product_id: string;
  code: string;
  name: string;
  description: string | null;
  status: PlanStatus;
  version: number;
  activated_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuotaRuleItem {
  id: string;
  product_id: string;
  plan_id: string;
  rule_key: string;
  limit_amount: number;
  window_duration_seconds: number;
  anchor_type: AnchorType;
  created_at: string;
  updated_at: string;
}

export interface OfferItem {
  id: string;
  product_id: string;
  plan_id: string;
  code: string;
  offer_type: OfferType;
  billing_cycle: BillingCycle;
  status: PlanStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PriceItem {
  id: string;
  offer_id: string;
  product_id: string;
  plan_id: string;
  currency: string;
  amount: number;
  status: PriceStatus;
  catalog_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductPayload {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string | null;
  status?: ProductStatus;
}

export interface CreatePlanPayload {
  code: string;
  name: string;
  description?: string;
  version?: number;
}

export interface UpdatePlanPayload {
  name?: string;
  description?: string | null;
}

export interface CreateQuotaRulePayload {
  rule_key: string;
  limit_amount: number;
  window_duration_seconds: number;
  anchor_type: AnchorType;
}

export interface UpdateQuotaRulePayload {
  limit_amount: number;
  window_duration_seconds: number;
}

export interface CreateOfferPayload {
  code: string;
  offer_type: OfferType;
  billing_cycle: BillingCycle;
  sort_order?: number;
}

export interface UpdateOfferPayload {
  sort_order: number;
}

export interface UpsertPricePayload {
  currency: string;
  amount: number;
  status?: PriceStatus;
}

export interface UpdatePriceStatusPayload {
  status: PriceStatus;
}

const PREFIX = '/product/v1/admin';

/**
 * Validates that a numeric value is a non-negative safe integer.
 */
export function validateSafeInteger(value: number, fieldName: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(
      `${fieldName} must be a valid safe integer (0 to ${Number.MAX_SAFE_INTEGER})`,
    );
  }
}

export const productService = {
  // --- Products ---
  async listProducts(): Promise<ProductItem[]> {
    const res = await authedClient.get<{ products: ProductItem[] }>(
      `${PREFIX}/products`,
    );
    return res.data.products || [];
  },

  async getProduct(id: string): Promise<ProductItem> {
    const res = await authedClient.get<ProductItem>(
      `${PREFIX}/products/${encodeURIComponent(id)}`,
    );
    return res.data;
  },

  async createProduct(payload: CreateProductPayload): Promise<ProductItem> {
    const res = await authedClient.post<ProductItem>(
      `${PREFIX}/products`,
      payload,
    );
    return res.data;
  },

  async updateProduct(
    id: string,
    payload: UpdateProductPayload,
  ): Promise<ProductItem> {
    const res = await authedClient.patch<ProductItem>(
      `${PREFIX}/products/${encodeURIComponent(id)}`,
      payload,
    );
    return res.data;
  },

  // --- Plans ---
  async listPlansByProduct(productId: string): Promise<PlanItem[]> {
    const res = await authedClient.get<{ plans: PlanItem[] }>(
      `${PREFIX}/products/${encodeURIComponent(productId)}/plans`,
    );
    return res.data.plans || [];
  },

  async getPlan(id: string): Promise<PlanItem> {
    const res = await authedClient.get<PlanItem>(
      `${PREFIX}/plans/${encodeURIComponent(id)}`,
    );
    return res.data;
  },

  async createPlan(
    productId: string,
    payload: CreatePlanPayload,
  ): Promise<PlanItem> {
    const res = await authedClient.post<PlanItem>(
      `${PREFIX}/products/${encodeURIComponent(productId)}/plans`,
      payload,
    );
    return res.data;
  },

  async updatePlan(id: string, payload: UpdatePlanPayload): Promise<PlanItem> {
    const res = await authedClient.patch<PlanItem>(
      `${PREFIX}/plans/${encodeURIComponent(id)}`,
      payload,
    );
    return res.data;
  },

  async activatePlan(id: string): Promise<PlanItem> {
    const res = await authedClient.post<PlanItem>(
      `${PREFIX}/plans/${encodeURIComponent(id)}/activate`,
    );
    return res.data;
  },

  async deactivatePlan(id: string): Promise<PlanItem> {
    const res = await authedClient.post<PlanItem>(
      `${PREFIX}/plans/${encodeURIComponent(id)}/deactivate`,
    );
    return res.data;
  },

  // --- Quotas ---
  async listQuotaRulesByPlan(planId: string): Promise<QuotaRuleItem[]> {
    const res = await authedClient.get<{
      quota_rules?: QuotaRuleItem[];
      quotas?: QuotaRuleItem[];
    }>(`${PREFIX}/plans/${encodeURIComponent(planId)}/quotas`);
    return res.data.quotas || res.data.quota_rules || [];
  },

  async createQuotaRule(
    planId: string,
    payload: CreateQuotaRulePayload,
  ): Promise<QuotaRuleItem> {
    validateSafeInteger(payload.limit_amount, 'Limit amount');
    validateSafeInteger(payload.window_duration_seconds, 'Window duration');
    const res = await authedClient.post<QuotaRuleItem>(
      `${PREFIX}/plans/${encodeURIComponent(planId)}/quotas`,
      payload,
    );
    return res.data;
  },

  async updateQuotaRule(
    id: string,
    payload: UpdateQuotaRulePayload,
  ): Promise<QuotaRuleItem> {
    validateSafeInteger(payload.limit_amount, 'Limit amount');
    validateSafeInteger(payload.window_duration_seconds, 'Window duration');
    const res = await authedClient.patch<QuotaRuleItem>(
      `${PREFIX}/quotas/${encodeURIComponent(id)}`,
      payload,
    );
    return res.data;
  },

  async deleteQuotaRule(id: string): Promise<void> {
    await authedClient.delete(`${PREFIX}/quotas/${encodeURIComponent(id)}`);
  },

  // --- Offers ---
  async listOffersByPlan(planId: string): Promise<OfferItem[]> {
    const res = await authedClient.get<{ offers: OfferItem[] }>(
      `${PREFIX}/plans/${encodeURIComponent(planId)}/offers`,
    );
    return res.data.offers || [];
  },

  async createOffer(
    planId: string,
    payload: CreateOfferPayload,
  ): Promise<OfferItem> {
    const res = await authedClient.post<OfferItem>(
      `${PREFIX}/plans/${encodeURIComponent(planId)}/offers`,
      payload,
    );
    return res.data;
  },

  async updateOffer(
    id: string,
    payload: UpdateOfferPayload,
  ): Promise<OfferItem> {
    const res = await authedClient.patch<OfferItem>(
      `${PREFIX}/offers/${encodeURIComponent(id)}`,
      payload,
    );
    return res.data;
  },

  async activateOffer(id: string): Promise<OfferItem> {
    const res = await authedClient.post<OfferItem>(
      `${PREFIX}/offers/${encodeURIComponent(id)}/activate`,
    );
    return res.data;
  },

  async deactivateOffer(id: string): Promise<OfferItem> {
    const res = await authedClient.post<OfferItem>(
      `${PREFIX}/offers/${encodeURIComponent(id)}/deactivate`,
    );
    return res.data;
  },

  // --- Prices ---
  async listPricesByOffer(offerId: string): Promise<PriceItem[]> {
    const res = await authedClient.get<{ prices: PriceItem[] }>(
      `${PREFIX}/offers/${encodeURIComponent(offerId)}/prices`,
    );
    return res.data.prices || [];
  },

  async upsertPrice(
    offerId: string,
    payload: UpsertPricePayload,
  ): Promise<PriceItem> {
    validateSafeInteger(payload.amount, 'Amount');
    const res = await authedClient.post<PriceItem>(
      `${PREFIX}/offers/${encodeURIComponent(offerId)}/prices`,
      payload,
    );
    return res.data;
  },

  async updatePriceStatus(
    id: string,
    payload: UpdatePriceStatusPayload,
  ): Promise<PriceItem> {
    const res = await authedClient.patch<PriceItem>(
      `${PREFIX}/prices/${encodeURIComponent(id)}`,
      payload,
    );
    return res.data;
  },
};
