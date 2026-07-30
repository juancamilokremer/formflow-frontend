import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  CandidateChecklist,
  PublicCandidateForm,
  PublicForm,
  SubmitPublicResponsePayload,
  SubmitPublicResponseResult,
} from '../models/public-form.model';

@Injectable({ providedIn: 'root' })
export class PublicResponseService {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/public`;

  getForm(formId: string): Observable<PublicForm> {
    return this.http
      .get<ApiResponse<PublicForm>>(`${this.apiUrl}/forms/${formId}`)
      .pipe(map((response) => response.data!));
  }

  submitResponse(
    formId: string,
    payload: SubmitPublicResponsePayload,
  ): Observable<SubmitPublicResponseResult> {
    return this.http
      .post<ApiResponse<SubmitPublicResponseResult>>(
        `${this.apiUrl}/forms/${formId}/responses`,
        payload,
      )
      .pipe(map((response) => response.data!));
  }

  getCandidateChecklist(token: string): Observable<CandidateChecklist> {
    return this.http
      .get<ApiResponse<CandidateChecklist>>(`${this.apiUrl}/candidates/${token}`)
      .pipe(map((response) => response.data!));
  }

  getCandidateForm(token: string, formId: string): Observable<PublicCandidateForm> {
    return this.http
      .get<ApiResponse<PublicCandidateForm>>(`${this.apiUrl}/candidates/${token}/forms/${formId}`)
      .pipe(map((response) => response.data!));
  }

  submitCandidateResponse(
    token: string,
    formId: string,
    payload: SubmitPublicResponsePayload,
  ): Observable<SubmitPublicResponseResult> {
    return this.http
      .post<ApiResponse<SubmitPublicResponseResult>>(
        `${this.apiUrl}/candidates/${token}/forms/${formId}/responses`,
        payload,
      )
      .pipe(map((response) => response.data!));
  }
}
