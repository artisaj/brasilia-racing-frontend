import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/app-endpoints';

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  show_in_navbar: boolean;
  navbar_order: number;
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
  show_in_navbar?: boolean;
  navbar_order?: number;
}

export interface UpdateCategoryPayload extends CreateCategoryPayload {}

@Injectable({
  providedIn: 'root',
})
export class AdminCategoriesService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = API_BASE_URL;

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

  update(categoryId: number, payload: UpdateCategoryPayload): Observable<ApiResponse<AdminCategory>> {
    return this.http.put<ApiResponse<AdminCategory>>(`${this.apiBase}/api/admin/categories/${categoryId}`, payload, {
      withCredentials: true,
    });
  }

  delete(categoryId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiBase}/api/admin/categories/${categoryId}`, {
      withCredentials: true,
    });
  }
}
