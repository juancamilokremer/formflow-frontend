import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { Branding, Tenant, TenantUsage } from '../../../../core/models/tenant.model';
import { UpdateBrandingRequest, UpdateTenantRequest } from '../models/tenant-settings.model';

@Injectable({ providedIn: 'root' })
export class TenantSettingsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/tenant`;

  getTenant(): Observable<Tenant> {
    return this.http.get<ApiResponse<Tenant>>(this.base).pipe(map((r) => r.data!));
  }

  updateTenant(request: UpdateTenantRequest): Observable<Tenant> {
    return this.http.put<ApiResponse<Tenant>>(this.base, request).pipe(map((r) => r.data!));
  }

  getUsage(): Observable<TenantUsage> {
    return this.http
      .get<ApiResponse<TenantUsage>>(`${this.base}/usage`)
      .pipe(map((r) => r.data!));
  }

  getBranding(): Observable<Branding> {
    return this.http
      .get<ApiResponse<Branding>>(`${this.base}/branding`)
      .pipe(map((r) => r.data!));
  }

  updateBranding(request: UpdateBrandingRequest): Observable<Branding> {
    return this.http
      .put<ApiResponse<Branding>>(`${this.base}/branding`, request)
      .pipe(map((r) => r.data!));
  }

  uploadLogo(file: File): Observable<Branding> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<ApiResponse<Branding>>(`${this.base}/branding/logo`, formData)
      .pipe(map((r) => r.data!));
  }

  deleteLogo(): Observable<Branding> {
    return this.http
      .delete<ApiResponse<Branding>>(`${this.base}/branding/logo`)
      .pipe(map((r) => r.data!));
  }
}
