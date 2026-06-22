export interface User {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantPlan: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  emailVerified: boolean;
}

export enum UserRole {
  TENANT_ADMIN = 'TENANT_ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}
