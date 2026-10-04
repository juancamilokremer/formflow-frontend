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

export const PLAN_CATALOG: PlanCatalogEntry[] = [
  {
    plan: Plan.FREE,
    priceAmount: '$0',
    popular: false,
    teaserFeatureKeys: [
      'plans.catalog.free.teaser.forms',
      'plans.catalog.free.teaser.responses',
      'plans.catalog.free.teaser.export',
    ],
    features: [
      { labelKey: 'plans.catalog.free.features.forms', included: true },
      { labelKey: 'plans.catalog.free.features.responses', included: true },
      { labelKey: 'plans.catalog.free.features.basic_stats', included: true },
      { labelKey: 'plans.catalog.free.features.export_csv', included: true },
      { labelKey: 'plans.catalog.shared.white_label', included: false },
      { labelKey: 'plans.catalog.shared.multi_user', included: false },
    ],
  },
  {
    plan: Plan.STARTER,
    priceAmount: '$19',
    popular: false,
    teaserFeatureKeys: [
      'plans.catalog.starter.teaser.forms',
      'plans.catalog.starter.teaser.responses',
      'plans.catalog.starter.teaser.export',
    ],
    features: [
      { labelKey: 'plans.catalog.starter.features.forms', included: true },
      { labelKey: 'plans.catalog.starter.features.responses', included: true },
      { labelKey: 'plans.catalog.starter.features.advanced_stats', included: true },
      { labelKey: 'plans.catalog.starter.features.export_excel', included: true },
      { labelKey: 'plans.catalog.shared.white_label', included: false },
      { labelKey: 'plans.catalog.shared.multi_user', included: false },
    ],
  },
  {
    plan: Plan.PRO,
    priceAmount: '$49',
    popular: true,
    teaserFeatureKeys: [
      'plans.catalog.pro.teaser.unlimited',
      'plans.catalog.pro.teaser.reports',
      'plans.catalog.pro.teaser.white_label',
    ],
    features: [
      { labelKey: 'plans.catalog.pro.features.unlimited_forms', included: true },
      { labelKey: 'plans.catalog.pro.features.unlimited_responses', included: true },
      { labelKey: 'plans.catalog.pro.features.advanced_reports', included: true },
      { labelKey: 'plans.catalog.pro.features.export_excel', included: true },
      { labelKey: 'plans.catalog.pro.features.white_label_partial', included: true },
      { labelKey: 'plans.catalog.shared.multi_user', included: false },
    ],
  },
  {
    plan: Plan.BUSINESS,
    priceAmount: '$99',
    popular: false,
    teaserFeatureKeys: [
      'plans.catalog.business.teaser.multi_user',
      'plans.catalog.business.teaser.api',
      'plans.catalog.business.teaser.domain',
    ],
    features: [
      { labelKey: 'plans.catalog.business.features.everything_pro', included: true },
      { labelKey: 'plans.catalog.business.features.multi_user', included: true },
      { labelKey: 'plans.catalog.business.features.api_webhooks', included: true },
      { labelKey: 'plans.catalog.business.features.own_domain', included: true },
      { labelKey: 'plans.catalog.business.features.white_label_full', included: true },
      { labelKey: 'plans.catalog.business.features.priority_support', included: true },
    ],
  },
  {
    plan: Plan.ENTERPRISE,
    priceAmount: null,
    popular: false,
    teaserFeatureKeys: [
      'plans.catalog.enterprise.teaser.sso',
      'plans.catalog.enterprise.teaser.sla',
      'plans.catalog.enterprise.teaser.onboarding',
    ],
    features: [
      { labelKey: 'plans.catalog.enterprise.features.everything_business', included: true },
      { labelKey: 'plans.catalog.enterprise.features.sso', included: true },
      { labelKey: 'plans.catalog.enterprise.features.isolated_db', included: true },
      { labelKey: 'plans.catalog.enterprise.features.sla', included: true },
      { labelKey: 'plans.catalog.enterprise.features.onboarding', included: true },
    ],
  },
];
