import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  AddCandidateRequest, AddConvocatoriaFormRequest, Candidate, ConvocatoriaDetail, ConvocatoriaForm,
  ConvocatoriaSummary, CreateConvocatoriaRequest, ImportResponse, UpdateConvocatoriaFormRequest,
  UpdateConvocatoriaRequest,
} from '../models/convocatoria.model';

@Injectable({ providedIn: 'root' })
export class ConvocatoriaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/convocatorias`;

  getAll(): Observable<ConvocatoriaSummary[]> {
    return this.http
      .get<ApiResponse<ConvocatoriaSummary[]>>(this.base)
      .pipe(map((r) => r.data ?? []));
  }

  getById(id: string): Observable<ConvocatoriaDetail> {
    return this.http
      .get<ApiResponse<ConvocatoriaDetail>>(`${this.base}/${id}`)
      .pipe(map((r) => r.data!));
  }

  create(request: CreateConvocatoriaRequest): Observable<ConvocatoriaDetail> {
    return this.http
      .post<ApiResponse<ConvocatoriaDetail>>(this.base, request)
      .pipe(map((r) => r.data!));
  }

  update(id: string, request: UpdateConvocatoriaRequest): Observable<ConvocatoriaDetail> {
    return this.http
      .put<ApiResponse<ConvocatoriaDetail>>(`${this.base}/${id}`, request)
      .pipe(map((r) => r.data!));
  }

  addForm(id: string, request: AddConvocatoriaFormRequest): Observable<ConvocatoriaForm> {
    return this.http
      .post<ApiResponse<ConvocatoriaForm>>(`${this.base}/${id}/forms`, request)
      .pipe(map((r) => r.data!));
  }

  updateForm(id: string, convocatoriaFormId: string, request: UpdateConvocatoriaFormRequest): Observable<ConvocatoriaForm> {
    return this.http
      .put<ApiResponse<ConvocatoriaForm>>(`${this.base}/${id}/forms/${convocatoriaFormId}`, request)
      .pipe(map((r) => r.data!));
  }

  removeForm(id: string, convocatoriaFormId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.base}/${id}/forms/${convocatoriaFormId}`)
      .pipe(map(() => undefined));
  }

  reorderForms(id: string, orderedConvocatoriaFormIds: string[]): Observable<ConvocatoriaForm[]> {
    return this.http
      .put<ApiResponse<ConvocatoriaForm[]>>(`${this.base}/${id}/forms/reorder`, { orderedConvocatoriaFormIds })
      .pipe(map((r) => r.data ?? []));
  }

  addCandidate(id: string, request: AddCandidateRequest): Observable<Candidate> {
    return this.http
      .post<ApiResponse<Candidate>>(`${this.base}/${id}/candidates`, request)
      .pipe(map((r) => r.data!));
  }

  importCandidates(id: string, file: File): Observable<ImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<ApiResponse<ImportResponse>>(`${this.base}/${id}/candidates/import`, formData)
      .pipe(map((r) => r.data!));
  }

  launch(id: string): Observable<ConvocatoriaDetail> {
    return this.http
      .post<ApiResponse<ConvocatoriaDetail>>(`${this.base}/${id}/launch`, {})
      .pipe(map((r) => r.data!));
  }

  close(id: string): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${this.base}/${id}/close`, {})
      .pipe(map(() => undefined));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.base}/${id}`)
      .pipe(map(() => undefined));
  }
}
