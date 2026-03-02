import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/app-endpoints';

export interface PublicComment {
  id: number;
  post_id: number;
  author_name: string;
  author_email: string;
  body: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface CreatePublicCommentPayload {
  author_name: string;
  author_email: string;
  body: string;
  recaptcha_token: string;
}

@Injectable({ providedIn: 'root' })
export class PublicCommentsService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = API_BASE_URL;

  listByPostSlug(slug: string): Observable<ApiResponse<PublicComment[]>> {
    return this.http.get<ApiResponse<PublicComment[]>>(`${this.apiBase}/api/public/posts/${slug}/comments`);
  }

  create(slug: string, payload: CreatePublicCommentPayload): Observable<ApiResponse<PublicComment>> {
    return this.http.post<ApiResponse<PublicComment>>(`${this.apiBase}/api/public/posts/${slug}/comments`, payload);
  }
}
