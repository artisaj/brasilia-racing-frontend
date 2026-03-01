import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/app-endpoints';

export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface AdminComment {
  id: number;
  post_id: number;
  author_name: string;
  author_email: string;
  body: string;
  status: CommentStatus;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
  post?: {
    id: number;
    title: string;
    slug: string;
  };
  reviewer?: {
    id: number;
    name: string;
    email: string;
  };
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

@Injectable({ providedIn: 'root' })
export class AdminCommentsService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = API_BASE_URL;

  list(status: CommentStatus): Observable<PaginatedResponse<AdminComment>> {
    return this.http.get<PaginatedResponse<AdminComment>>(
      `${this.apiBase}/api/admin/comments?status=${status}`,
      {
        withCredentials: true,
      }
    );
  }

  approve(commentId: number): Observable<ApiResponse<AdminComment>> {
    return this.http.post<ApiResponse<AdminComment>>(
      `${this.apiBase}/api/admin/comments/${commentId}/approve`,
      {},
      { withCredentials: true }
    );
  }

  reject(commentId: number): Observable<ApiResponse<AdminComment>> {
    return this.http.post<ApiResponse<AdminComment>>(
      `${this.apiBase}/api/admin/comments/${commentId}/reject`,
      {},
      { withCredentials: true }
    );
  }

  remove(commentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiBase}/api/admin/comments/${commentId}`, {
      withCredentials: true,
    });
  }
}
