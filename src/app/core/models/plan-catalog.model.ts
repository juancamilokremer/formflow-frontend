import { Plan } from './tenant.model';

export type PlanLimitKey = 'forms' | 'responses' | 'users' | 'convocatorias' | 'canExportExcel';

export interface PlanFeatureItem {
  /** Static fallback text/flag, used only if live limits haven't loaded or the fetch failed. */
  labelKey: string;
  included: boolean;
  /** When set, PlanCardComponent prefers the live number/flag from PlanLimits over the
   *  static labelKey/included above — see its LIMIT_I18N map for the live phrasing. */
  limitKey?: PlanLimitKey;
}

export interface PlanCatalogEntry {
  plan: Plan;
  /** Literal display price (currency amount is language-neutral); null for Enterprise ("Personalizado"). */
  priceAmount: string | null;
  /** Short checklist shown in the landing teaser (3 items, matches the marketing mockup) —
   *  same shape/resolver as `features` so teaser numbers can never drift from the real ones. */
  teaserFeatures: PlanFeatureItem[];
  /** Full checklist shown on /plans, including muted "not included" items. */
  features: PlanFeatureItem[];
  popular: boolean;
}

export type PlanCardCta =
  | { kind: 'navigate'; routerLink: string[]; labelKey: string }
  | { kind: 'external'; href: string; labelKey: string }
  | { kind: 'action'; labelKey: string }
  | { kind: 'disabled'; labelKey: string };

/** What PlanCardComponent.resolve() renders for a single feature row — either the live
 *  number/flag from PlanLimits or the static labelKey/included fallback. */
export interface ResolvedPlanFeature {
  labelKey: string;
  params?: Record<string, number>;
  included: boolean;
}

export type NumericLimitKey = Exclude<PlanLimitKey, 'canExportExcel'>;

/** i18n keys PlanCardComponent picks between per numeric limit, based on the live value:
 *  null → unlimited, 0 → zero (if defined), 1 → countSingular (if defined), else → count. */
export const LIMIT_I18N: Record<NumericLimitKey, { count: string; unlimited: string; zero?: string; countSingular?: string }> = {
  forms: { count: 'plans.catalog.limits.forms_count', unlimited: 'plans.catalog.limits.forms_unlimited' },
  responses: { count: 'plans.catalog.limits.responses_count', unlimited: 'plans.catalog.limits.responses_unlimited' },
  users: {
    count: 'plans.catalog.limits.users_count',
    countSingular: 'plans.catalog.limits.users_count_singular',
    unlimited: 'plans.catalog.limits.users_unlimited',
  },
  convocatorias: {
    count: 'plans.catalog.limits.convocatorias_count',
    unlimited: 'plans.catalog.limits.convocatorias_unlimited',
    zero: 'plans.catalog.limits.convocatorias_none',
  },
};

/**
 * Every item here is a real, enforced limit (see backend PlanLimits.java) or,
 * for Enterprise, a human/contractual deliverable that doesn't need code
 * (dedicated support, custom SLA, onboarding). Nothing here claims a feature
 * that doesn't exist — see backend#192 for the audit that removed the
 * previous Business tier and the false "API/webhooks/custom domain/SSO/
 * isolated DB/white-label" claims. Numeric items carry a `limitKey` so
 * PlanCardComponent can show the live, admin-edited number instead of the
 * static fallback below (see backend#28-plan-limits / PlanLimitsService).
 */
export const PLAN_CATALOG: PlanCatalogEntry[] = [
  {
    plan: Plan.FREE,
    priceAmount: '$0',
    popular: false,
    teaserFeatures: [
      { labelKey: 'plans.catalog.free.teaser.forms', included: true, limitKey: 'forms' },
      { labelKey: 'plans.catalog.free.teaser.responses', included: true, limitKey: 'responses' },
      { labelKey: 'plans.catalog.free.teaser.export_csv', included: true },
    ],
    features: [
      { labelKey: 'plans.catalog.free.features.forms', included: true, limitKey: 'forms' },
      { labelKey: 'plans.catalog.free.features.responses', included: true, limitKey: 'responses' },
      { labelKey: 'plans.catalog.free.features.users', included: true, limitKey: 'users' },
      { labelKey: 'plans.catalog.free.features.convocatorias', included: false, limitKey: 'convocatorias' },
      { labelKey: 'plans.catalog.free.features.export_csv', included: true },
      { labelKey: 'plans.catalog.free.features.export_excel', included: false, limitKey: 'canExportExcel' },
    ],
  },
  {
    plan: Plan.STARTER,
    priceAmount: '$19',
    popular: false,
    teaserFeatures: [
      { labelKey: 'plans.catalog.starter.teaser.forms', included: true, limitKey: 'forms' },
      { labelKey: 'plans.catalog.starter.teaser.responses', included: true, limitKey: 'responses' },
      { labelKey: 'plans.catalog.starter.teaser.export_excel', included: true, limitKey: 'canExportExcel' },
    ],
    features: [
      { labelKey: 'plans.catalog.starter.features.forms', included: true, limitKey: 'forms' },
      { labelKey: 'plans.catalog.starter.features.responses', included: true, limitKey: 'responses' },
      { labelKey: 'plans.catalog.starter.features.users', included: true, limitKey: 'users' },
      { labelKey: 'plans.catalog.starter.features.convocatorias', included: true, limitKey: 'convocatorias' },
      { labelKey: 'plans.catalog.starter.features.export_excel', included: true, limitKey: 'canExportExcel' },
    ],
  },
  {
    plan: Plan.PRO,
    priceAmount: '$49',
    popular: true,
    teaserFeatures: [
      { labelKey: 'plans.catalog.pro.teaser.forms', included: true, limitKey: 'forms' },
      { labelKey: 'plans.catalog.pro.teaser.users', included: true, limitKey: 'users' },
      { labelKey: 'plans.catalog.pro.teaser.convocatorias', included: true, limitKey: 'convocatorias' },
    ],
    features: [
      { labelKey: 'plans.catalog.pro.features.forms', included: true, limitKey: 'forms' },
      { labelKey: 'plans.catalog.pro.features.responses', included: true, limitKey: 'responses' },
      { labelKey: 'plans.catalog.pro.features.users', included: true, limitKey: 'users' },
      { labelKey: 'plans.catalog.pro.features.convocatorias', included: true, limitKey: 'convocatorias' },
      { labelKey: 'plans.catalog.pro.features.export_excel', included: true, limitKey: 'canExportExcel' },
    ],
  },
  {
    plan: Plan.ENTERPRISE,
    priceAmount: null,
    popular: false,
    teaserFeatures: [
      { labelKey: 'plans.catalog.enterprise.teaser.dedicated_support', included: true },
      { labelKey: 'plans.catalog.enterprise.teaser.custom_sla', included: true },
      { labelKey: 'plans.catalog.enterprise.teaser.custom_onboarding', included: true },
    ],
    features: [
      { labelKey: 'plans.catalog.enterprise.features.everything_pro', included: true },
      { labelKey: 'plans.catalog.enterprise.features.dedicated_support', included: true },
      { labelKey: 'plans.catalog.enterprise.features.custom_sla', included: true },
      { labelKey: 'plans.catalog.enterprise.features.custom_onboarding', included: true },
    ],
  },
];
