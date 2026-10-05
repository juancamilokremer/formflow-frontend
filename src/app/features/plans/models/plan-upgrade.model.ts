import { Plan } from '../../../core/models/tenant.model';

export interface PlanUpgradeRequest {
  requestedPlan: Plan;
  message?: string;
}
