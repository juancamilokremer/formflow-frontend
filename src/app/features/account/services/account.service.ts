import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Me, UpdateMeRequest } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/me`;

  getMe(): Observable<Me> {
    return this.http.get<ApiResponse<Me>>(this.base).pipe(map((r) => r.data!));
  }

  updateMe(request: UpdateMeRequest): Observable<Me> {
    return this.http.put<ApiResponse<Me>>(this.base, request).pipe(map((r) => r.data!));
  }

  uploadAvatar(file: File): Observable<Me> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<ApiResponse<Me>>(`${this.base}/avatar`, formData)
      .pipe(map((r) => r.data!));
  }

  deleteAvatar(): Observable<Me> {
    return this.http
      .delete<ApiResponse<Me>>(`${this.base}/avatar`)
      .pipe(map((r) => r.data!));
  }
}
