export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  stripeCustomerId?: string;
}

export enum Plan {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
  BUSINESS = 'BUSINESS',
  ENTERPRISE = 'ENTERPRISE',
}
