import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Form, CreateFormRequest } from '../models/form.model';

@Injectable({ providedIn: 'root' })
export class FormsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/forms`;

  getAll(): Observable<Form[]> {
    return this.http.get<ApiResponse<Form[]>>(this.apiUrl).pipe(
      map((r) => r.data ?? []),
    );
  }

  create(req: CreateFormRequest): Observable<Form> {
    return this.http.post<ApiResponse<Form>>(this.apiUrl, req).pipe(
      map((r) => r.data!),
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
