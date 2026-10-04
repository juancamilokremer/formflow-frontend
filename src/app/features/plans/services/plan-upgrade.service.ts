import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { PlanUpgradeRequest } from '../models/plan-upgrade.model';

@Injectable({ providedIn: 'root' })
export class PlanUpgradeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/tenant`;

  /** Backend endpoint tracked in formflow-backend#191. */
  requestUpgrade(request: PlanUpgradeRequest): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${this.base}/plan-upgrade-request`, request)
      .pipe(map(() => undefined));
  }
}
