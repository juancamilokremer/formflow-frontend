import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
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
      .pipe(map((r) => r.data!));
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
      .pipe(map((r) => r.data!));
  }
}
