import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TenantUsage } from '../../../core/models/tenant.model';
import { UserRole } from '../../../core/models/user.model';
import { InviteUserRequest, PendingInvitation, TeamMember } from '../models/user-management.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/users`;

  listUsers(): Observable<TeamMember[]> {
    return this.http.get<ApiResponse<TeamMember[]>>(this.base).pipe(map((r) => r.data ?? []));
  }

  /** Returns the created (or renewed) invitation — inviting an email that already has a
   *  pending invitation silently cancels the old one on the backend and issues a new id. */
  inviteUser(request: InviteUserRequest): Observable<PendingInvitation> {
    return this.http
      .post<ApiResponse<PendingInvitation>>(`${this.base}/invite`, request)
      .pipe(map((r) => r.data!));
  }

  listInvitations(): Observable<PendingInvitation[]> {
    return this.http
      .get<ApiResponse<PendingInvitation[]>>(`${this.base}/invitations`)
      .pipe(map((r) => r.data ?? []));
  }

  cancelInvitation(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.base}/invitations/${id}`)
      .pipe(map(() => undefined));
  }

  changeRole(id: string, role: UserRole): Observable<TeamMember> {
    return this.http
      .put<ApiResponse<TeamMember>>(`${this.base}/${id}/role`, { role })
      .pipe(map((r) => r.data!));
  }

  revokeAccess(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`).pipe(map(() => undefined));
  }

  getUsage(): Observable<TenantUsage> {
    return this.http
      .get<ApiResponse<TenantUsage>>(`${environment.apiUrl}/tenant/usage`)
      .pipe(map((r) => r.data!));
  }
}
