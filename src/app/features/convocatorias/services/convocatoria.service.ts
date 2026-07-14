import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ConvocatoriaSummary } from '../models/convocatoria.model';

interface ApiResponse<T> {
  data: T;
}

@Injectable({ providedIn: 'root' })
export class ConvocatoriaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/convocatorias`;

  getAll(): Observable<ConvocatoriaSummary[]> {
    return this.http
      .get<ApiResponse<ConvocatoriaSummary[]>>(this.base)
      .pipe(map((r) => r.data));
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
