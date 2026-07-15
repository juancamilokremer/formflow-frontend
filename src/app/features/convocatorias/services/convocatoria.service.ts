import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  AddCandidateRequest, Candidate, ConvocatoriaDetail, ConvocatoriaSummary,
  CreateConvocatoriaRequest, ImportResponse,
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
