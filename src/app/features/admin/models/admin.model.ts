import { Plan, TenantStatus } from '../../../core/models/tenant.model';

export interface AdminTenantSummary {
  id: string;
  slug: string;
  name: string;
  plan: Plan;
  status: TenantStatus;
  createdAt: string;
}

export interface AdminTenantPage {
  items: AdminTenantSummary[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface GlobalStats {
  totalTenants: number;
  responsesThisMonth: number;
  tenantsByPlan: Partial<Record<Plan, number>>;
}

export type AdminStatusFilter = TenantStatus | 'ALL';
export type AdminPlanFilter = Plan | 'ALL';

export type LimitFieldKey = 'forms' | 'responses' | 'users' | 'convocatorias';

export interface EditableLimitField {
  value: number;
  unlimited: boolean;
}

export interface EditablePlanLimitsRow {
  plan: Plan;
  forms: EditableLimitField;
  responses: EditableLimitField;
  users: EditableLimitField;
  convocatorias: EditableLimitField;
  canExportExcel: boolean;
  saving: boolean;
  saved: boolean;
  error: string | null;
}
