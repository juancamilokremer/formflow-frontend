import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  Form, FormDetail, FormSection, FormQuestion, FormStatus,
  CreateFormRequest, CreateSectionRequest, UpdateSectionRequest,
  AddQuestionRequest, UpdateQuestionRequest,
} from '../models/form.model';
import { FormStats } from '../models/form-stats.model';
import { ExportFormat, ExportedFile, ResponseDetail, ResponsePage } from '../models/form-response.model';

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

  duplicate(id: string): Observable<Form> {
    return this.http.post<ApiResponse<Form>>(`${this.apiUrl}/${id}/duplicate`, {}).pipe(
      map((r) => r.data!),
    );
  }

  updateStatus(id: string, status: FormStatus): Observable<Form> {
    return this.http.patch<ApiResponse<Form>>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      map((r) => r.data!),
    );
  }

  getStats(id: string, from?: string, to?: string): Observable<FormStats> {
    return this.http
      .get<ApiResponse<FormStats>>(`${this.apiUrl}/${id}/stats`, { params: dateRangeParams(from, to) })
      .pipe(map((r) => r.data!));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getResponses(
    formId: string, page: number, size?: number, from?: string, to?: string,
  ): Observable<ResponsePage> {
    const params: Record<string, string | number> = { page, ...dateRangeParams(from, to) };
    if (size !== undefined) params['size'] = size;
    return this.http
      .get<ApiResponse<ResponsePage>>(`${this.apiUrl}/${formId}/responses`, { params })
      .pipe(map((r) => r.data!));
  }

  getResponseDetail(formId: string, responseId: string): Observable<ResponseDetail> {
    return this.http
      .get<ApiResponse<ResponseDetail>>(`${this.apiUrl}/${formId}/responses/${responseId}`)
      .pipe(map((r) => r.data!));
  }

  exportResponses(formId: string, format: ExportFormat, from?: string, to?: string): Observable<ExportedFile> {
    // The export is generated server-side (no browser involved there), so the
    // caller's IANA zone travels with the request — otherwise "Fecha de envío"
    // would be rendered in the server's zone instead of the viewer's own.
    const params = { ...dateRangeParams(from, to), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone };
    return this.http
      .get(`${this.apiUrl}/${formId}/export/${format}`, {
        params, responseType: 'blob', observe: 'response',
      })
      .pipe(map((response) => ({
        blob: response.body!,
        filename: filenameFromContentDisposition(response.headers.get('content-disposition')) ?? `export.${format}`,
      })));
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

  addQuestion(formId: string, sectionId: string, req: AddQuestionRequest): Observable<FormQuestion> {
    return this.http
      .post<ApiResponse<FormQuestion>>(`${this.apiUrl}/${formId}/sections/${sectionId}/questions`, req)
      .pipe(map((r) => r.data!));
  }

  updateQuestion(
    formId: string,
    sectionId: string,
    questionId: string,
    req: UpdateQuestionRequest,
  ): Observable<FormQuestion> {
    return this.http
      .put<ApiResponse<FormQuestion>>(
        `${this.apiUrl}/${formId}/sections/${sectionId}/questions/${questionId}`,
        req,
      )
      .pipe(map((r) => r.data!));
  }

  deleteQuestion(formId: string, sectionId: string, questionId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${formId}/sections/${sectionId}/questions/${questionId}`,
    );
  }

  reorderSections(formId: string, orderedSectionIds: string[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${formId}/sections/reorder`, { orderedSectionIds });
  }

  reorderQuestions(formId: string, sectionId: string, orderedQuestionIds: string[]): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${formId}/sections/${sectionId}/questions/reorder`,
      { orderedQuestionIds },
    );
  }
}

export function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const match = header.match(/filename="?([^";]+)"?/);
  return match ? match[1] : null;
}

function dateRangeParams(from?: string, to?: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (from !== undefined) params['submittedAtFrom'] = from;
  if (to !== undefined) params['submittedAtTo'] = to;
  return params;
}
