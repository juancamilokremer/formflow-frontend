import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Plan, TenantStatus } from '../../../core/models/tenant.model';
import { AdminTenantPage, AdminTenantSummary, GlobalStats } from '../models/admin.model';

function tenantFilterParams(status?: TenantStatus, plan?: Plan): Record<string, string> {
  const params: Record<string, string> = {};
  if (status !== undefined) params['status'] = status;
  if (plan !== undefined) params['plan'] = plan;
  return params;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  listTenants(
    page: number, size: number, status?: TenantStatus, plan?: Plan,
  ): Observable<AdminTenantPage> {
    const params: Record<string, string | number> = { page, size, ...tenantFilterParams(status, plan) };
    return this.http
      .get<ApiResponse<AdminTenantPage>>(`${this.apiUrl}/tenants`, { params })
      .pipe(map((r) => r.data!));
  }

  getStats(): Observable<GlobalStats> {
    return this.http
      .get<ApiResponse<GlobalStats>>(`${this.apiUrl}/stats`)
      .pipe(map((r) => r.data!));
  }

  suspendTenant(id: string): Observable<AdminTenantSummary> {
    return this.http
      .put<ApiResponse<AdminTenantSummary>>(`${this.apiUrl}/tenants/${id}/suspend`, {})
      .pipe(map((r) => r.data!));
  }

  activateTenant(id: string): Observable<AdminTenantSummary> {
    return this.http
      .put<ApiResponse<AdminTenantSummary>>(`${this.apiUrl}/tenants/${id}/activate`, {})
      .pipe(map((r) => r.data!));
  }

  changePlan(id: string, plan: Plan): Observable<AdminTenantSummary> {
    return this.http
      .put<ApiResponse<AdminTenantSummary>>(`${this.apiUrl}/tenants/${id}/plan`, { plan })
      .pipe(map((r) => r.data!));
  }
}
