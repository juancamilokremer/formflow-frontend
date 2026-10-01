export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  status?: TenantStatus;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  stripeCustomerId?: string;
}

export enum Plan {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
  BUSINESS = 'BUSINESS',
  ENTERPRISE = 'ENTERPRISE',
}

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
}

/** From GET /tenant/usage — a null limit means the plan has no cap on that resource. */
export interface TenantUsage {
  plan: Plan;
  formsUsed: number;
  formsLimit: number | null;
  responsesThisMonth: number;
  responsesLimit: number | null;
  usersCount: number;
  usersLimit: number | null;
  canExportExcel: boolean;
}

/** Shape of GET/PUT /tenant/branding and GET /public/branding/{slug} — deliberately
 *  narrower than Tenant (no id/slug/plan/status), matches the backend's BrandingResponse. */
export interface Branding {
  tenantName: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  faviconUrl: string | null;
}
