import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PostAuthor {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'redator';
}

export type PostStatus = 'draft' | 'in_review' | 'published' | 'scheduled';

export interface AdminPost {
  id: number;
  title: string;
  subtitle: string | null;
  slug: string;
  content: string;
  status: PostStatus;
  published_at: string | null;
  scheduled_at: string | null;
  author_id: number;
  category_id: number | null;
  created_at: string;
  updated_at: string;
  author?: PostAuthor;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface CreatePostPayload {
  title: string;
  subtitle?: string;
  slug?: string;
  content: string;
  status?: PostStatus;
}

@Injectable({
  providedIn: 'root',
})
export class AdminPostsService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://localhost:8000';

  list(): Observable<PaginatedResponse<AdminPost>> {
    return this.http.get<PaginatedResponse<AdminPost>>(`${this.apiBase}/api/admin/posts`, {
      withCredentials: true,
    });
  }

  create(payload: CreatePostPayload): Observable<ApiResponse<AdminPost>> {
    return this.http.post<ApiResponse<AdminPost>>(`${this.apiBase}/api/admin/posts`, payload, {
      withCredentials: true,
    });
  }
}
