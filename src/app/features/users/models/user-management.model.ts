import { UserRole } from '../../../core/models/user.model';
import { TenantUsage } from '../../../core/models/tenant.model';

export interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  active: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface PendingInvitation {
  id: string;
  email: string;
  role: UserRole;
  expiresAt: string;
  createdAt: string;
}

export interface InviteUserRequest {
  email: string;
  role: UserRole;
}

/** Shared by the header's "Invitar usuario" trigger and the invite modal's submit button
 *  so both agree on when the plan's user limit has been reached. */
export function isAtUserLimit(usage: TenantUsage | null): boolean {
  return !!usage && usage.usersLimit !== null && usage.usersCount >= usage.usersLimit;
}
