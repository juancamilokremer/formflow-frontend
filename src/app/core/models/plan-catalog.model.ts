import { Plan } from './tenant.model';

export interface PlanFeatureItem {
  labelKey: string;
  included: boolean;
}

export interface PlanCatalogEntry {
  plan: Plan;
  /** Literal display price (currency amount is language-neutral); null for Enterprise ("Personalizado"). */
  priceAmount: string | null;
  /** Short checklist shown in the landing teaser (3 items, matches the marketing mockup). */
  teaserFeatureKeys: string[];
  /** Full checklist shown on /plans, including muted "not included" items. */
  features: PlanFeatureItem[];
  popular: boolean;
}

/**
 * Every item here is a real, enforced limit (see backend PlanLimits.java) or,
 * for Enterprise, a human/contractual deliverable that doesn't need code
 * (dedicated support, custom SLA, onboarding). Nothing here claims a feature
 * that doesn't exist — see backend#192 for the audit that removed the
 * previous Business tier and the false "API/webhooks/custom domain/SSO/
 * isolated DB/white-label" claims.
 */
export const PLAN_CATALOG: PlanCatalogEntry[] = [
  {
    plan: Plan.FREE,
    priceAmount: '$0',
    popular: false,
    teaserFeatureKeys: [
      'plans.catalog.free.teaser.forms',
      'plans.catalog.free.teaser.responses',
      'plans.catalog.free.teaser.export_csv',
    ],
    features: [
      { labelKey: 'plans.catalog.free.features.forms', included: true },
      { labelKey: 'plans.catalog.free.features.responses', included: true },
      { labelKey: 'plans.catalog.free.features.users', included: true },
      { labelKey: 'plans.catalog.free.features.convocatorias', included: false },
      { labelKey: 'plans.catalog.free.features.export_csv', included: true },
      { labelKey: 'plans.catalog.free.features.export_excel', included: false },
    ],
  },
  {
    plan: Plan.STARTER,
    priceAmount: '$19',
    popular: false,
    teaserFeatureKeys: [
      'plans.catalog.starter.teaser.forms',
      'plans.catalog.starter.teaser.responses',
      'plans.catalog.starter.teaser.export_excel',
    ],
    features: [
      { labelKey: 'plans.catalog.starter.features.forms', included: true },
      { labelKey: 'plans.catalog.starter.features.responses', included: true },
      { labelKey: 'plans.catalog.starter.features.users', included: true },
      { labelKey: 'plans.catalog.starter.features.convocatorias', included: true },
      { labelKey: 'plans.catalog.starter.features.export_excel', included: true },
    ],
  },
  {
    plan: Plan.PRO,
    priceAmount: '$49',
    popular: true,
    teaserFeatureKeys: [
      'plans.catalog.pro.teaser.forms',
      'plans.catalog.pro.teaser.users',
      'plans.catalog.pro.teaser.convocatorias',
    ],
    features: [
      { labelKey: 'plans.catalog.pro.features.forms', included: true },
      { labelKey: 'plans.catalog.pro.features.responses', included: true },
      { labelKey: 'plans.catalog.pro.features.users', included: true },
      { labelKey: 'plans.catalog.pro.features.convocatorias', included: true },
      { labelKey: 'plans.catalog.pro.features.export_excel', included: true },
    ],
  },
  {
    plan: Plan.ENTERPRISE,
    priceAmount: null,
    popular: false,
    teaserFeatureKeys: [
      'plans.catalog.enterprise.teaser.dedicated_support',
      'plans.catalog.enterprise.teaser.custom_sla',
      'plans.catalog.enterprise.teaser.custom_onboarding',
    ],
    features: [
      { labelKey: 'plans.catalog.enterprise.features.everything_pro', included: true },
      { labelKey: 'plans.catalog.enterprise.features.dedicated_support', included: true },
      { labelKey: 'plans.catalog.enterprise.features.custom_sla', included: true },
      { labelKey: 'plans.catalog.enterprise.features.custom_onboarding', included: true },
    ],
  },
];
