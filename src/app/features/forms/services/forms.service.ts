import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  Form, FormDetail, FormSection,
  CreateFormRequest, CreateSectionRequest, UpdateSectionRequest,
} from '../models/form.model';

@Injectable({ providedIn: 'root' })
export class FormsService {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/forms`;

  getAll(): Observable<Form[]> {
    return this.http.get<ApiResponse<Form[]>>(this.apiUrl).pipe(
      map((r) => r.data ?? []),
    );
  }

  getById(id: string): Observable<FormDetail> {
    return this.http.get<ApiResponse<FormDetail>>(`${this.apiUrl}/${id}`).pipe(
      map((r) => r.data!),
    );
  }

  create(req: CreateFormRequest): Observable<Form> {
    return this.http.post<ApiResponse<Form>>(this.apiUrl, req).pipe(
      map((r) => r.data!),
    );
  }

  update(id: string, name: string, description: string | null, timeLimitSeconds: number | null): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, { name, description, timeLimitSeconds });
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  createSection(formId: string, req: CreateSectionRequest): Observable<FormSection> {
    return this.http.post<ApiResponse<FormSection>>(`${this.apiUrl}/${formId}/sections`, req).pipe(
      map((r) => r.data!),
    );
  }

  updateSection(formId: string, sectionId: string, req: UpdateSectionRequest): Observable<FormSection> {
    return this.http
      .put<ApiResponse<FormSection>>(`${this.apiUrl}/${formId}/sections/${sectionId}`, req)
      .pipe(map((r) => r.data!));
  }

  deleteSection(formId: string, sectionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${formId}/sections/${sectionId}`);
  }
}
