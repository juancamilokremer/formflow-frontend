import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PlanLimits } from '../models/plan-limits.model';

@Injectable({ providedIn: 'root' })
export class PlanLimitsService {
  private readonly http = inject(HttpClient);

  /** Public, unauthenticated — feeds the landing/plans pricing cards. Falls back to an
   *  empty list on error instead of throwing, so the pricing page degrades gracefully. */
  getPublicLimits(): Observable<PlanLimits[]> {
    return this.http
      .get<ApiResponse<PlanLimits[]>>(`${environment.apiUrl}/public/plan-limits`)
      .pipe(map((r) => r.data ?? []));
  }
}
