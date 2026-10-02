import { UserRole } from '../../../core/models/user.model';

/** GET /me */
export interface Me {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
}

/** PUT /me — never includes email, changing it needs re-verification (out of scope). */
export interface UpdateMeRequest {
  firstName: string;
  lastName: string;
}
