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
