import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/categories`;

  getAll(): Observable<Category[]> {
    return this.http
      .get<ApiResponse<Category[]>>(this.base)
      .pipe(map((r) => r.data ?? []));
  }

  create(request: CreateCategoryRequest): Observable<Category> {
    return this.http
      .post<ApiResponse<Category>>(this.base, request)
      .pipe(map((r) => r.data!));
  }

  update(id: string, request: UpdateCategoryRequest): Observable<Category> {
    return this.http
      .put<ApiResponse<Category>>(`${this.base}/${id}`, request)
      .pipe(map((r) => r.data!));
  }

  remove(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.base}/${id}`)
      .pipe(map(() => undefined));
  }
}
