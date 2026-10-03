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
  avatarUrl?: string | null;
}

export enum UserRole {
  TENANT_ADMIN = 'TENANT_ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
  SUPER_ADMIN = 'SUPER_ADMIN',
}
