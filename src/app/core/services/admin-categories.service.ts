import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  posts_count?: number;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminCategoriesService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://localhost:8000';

  list(): Observable<ApiResponse<AdminCategory[]>> {
    return this.http.get<ApiResponse<AdminCategory[]>>(`${this.apiBase}/api/admin/categories`, {
      withCredentials: true,
    });
  }

  create(payload: CreateCategoryPayload): Observable<ApiResponse<AdminCategory>> {
    return this.http.post<ApiResponse<AdminCategory>>(`${this.apiBase}/api/admin/categories`, payload, {
      withCredentials: true,
    });
  }

  delete(categoryId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiBase}/api/admin/categories/${categoryId}`, {
      withCredentials: true,
    });
  }
}
