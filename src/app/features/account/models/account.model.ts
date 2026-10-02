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

/** PUT /me/password — requires the current password since there's an active session
 *  (unlike the forgot/reset-by-email flow, which proves inbox ownership instead). */
export interface ChangeMyPasswordRequest {
  currentPassword: string;
  newPassword: string;
}
