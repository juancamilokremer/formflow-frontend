import { UserRole } from '../../../core/models/user.model';

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
