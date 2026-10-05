import { Plan } from './tenant.model';

/** From GET /public/plan-limits and GET /admin/plan-limits — a null limit means
 *  the plan has no cap on that resource, same convention as TenantUsage. */
export interface PlanLimits {
  plan: Plan;
  formsLimit: number | null;
  responsesLimit: number | null;
  usersLimit: number | null;
  convocatoriasLimit: number | null;
  canExportExcel: boolean;
}

export interface UpdatePlanLimitsRequest {
  formsLimit: number | null;
  responsesLimit: number | null;
  usersLimit: number | null;
  convocatoriasLimit: number | null;
  canExportExcel: boolean;
}
