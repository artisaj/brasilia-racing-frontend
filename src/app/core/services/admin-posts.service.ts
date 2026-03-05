import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/app-endpoints';

export interface PostAuthor {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'redator';
}

export interface PostCategory {
  id: number;
  name: string;
  slug: string;
}

export interface PostCoverMedia {
  id: number;
  thumb_url: string;
  card_url: string;
  hero_url: string;
  full_url: string;
}

export type PostStatus = 'draft' | 'in_review' | 'published' | 'scheduled';

export interface AdminPost {
  id: number;
  title: string;
  subtitle: string | null;
  slug: string;
  content: string;
  status: PostStatus;
  is_featured: boolean;
  featured_order: number | null;
  published_at: string | null;
  scheduled_at: string | null;
  author_id: number;
  category_id: number | null;
  created_at: string;
  updated_at: string;
  author?: PostAuthor;
  category?: PostCategory;
  cover_media?: PostCoverMedia | null;
  coverMedia?: PostCoverMedia | null;
  cover_focus_x?: number;
  cover_focus_y?: number;
  cover_zoom?: number;
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
  category_id?: number | null;
  cover_media_id?: number | null;
  cover_focus_x?: number;
  cover_focus_y?: number;
  cover_zoom?: number;
}

export interface UpdatePostPayload extends CreatePostPayload {}

export interface ReorderFeaturedPayload {
  post_ids: number[];
}

export interface FeaturePostPayload {
  cover_focus_x?: number;
  cover_focus_y?: number;
  cover_zoom?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminPostsService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = API_BASE_URL;

  list(page = 1, perPage = 15): Observable<PaginatedResponse<AdminPost>> {
    return this.http.get<PaginatedResponse<AdminPost>>(`${this.apiBase}/api/admin/posts`, {
      params: {
        page,
        per_page: perPage,
      },
      withCredentials: true,
    });
  }

  create(payload: CreatePostPayload): Observable<ApiResponse<AdminPost>> {
    return this.http.post<ApiResponse<AdminPost>>(`${this.apiBase}/api/admin/posts`, payload, {
      withCredentials: true,
    });
  }

  show(postId: number): Observable<ApiResponse<AdminPost>> {
    return this.http.get<ApiResponse<AdminPost>>(`${this.apiBase}/api/admin/posts/${postId}`, {
      withCredentials: true,
    });
  }

  update(postId: number, payload: UpdatePostPayload): Observable<ApiResponse<AdminPost>> {
    return this.http.put<ApiResponse<AdminPost>>(`${this.apiBase}/api/admin/posts/${postId}`, payload, {
      withCredentials: true,
    });
  }

  remove(postId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiBase}/api/admin/posts/${postId}`, {
      withCredentials: true,
    });
  }

  feature(postId: number, payload: FeaturePostPayload = {}): Observable<ApiResponse<AdminPost>> {
    return this.http.post<ApiResponse<AdminPost>>(`${this.apiBase}/api/admin/posts/${postId}/feature`, payload, {
      withCredentials: true,
    });
  }

  listFeatured(): Observable<ApiResponse<AdminPost[]>> {
    return this.http.get<ApiResponse<AdminPost[]>>(`${this.apiBase}/api/admin/posts/featured/list`, {
      withCredentials: true,
    });
  }

  reorderFeatured(payload: ReorderFeaturedPayload): Observable<ApiResponse<AdminPost[]>> {
    return this.http.post<ApiResponse<AdminPost[]>>(`${this.apiBase}/api/admin/posts/featured/reorder`, payload, {
      withCredentials: true,
    });
  }

  unfeature(postId: number): Observable<ApiResponse<AdminPost>> {
    return this.http.post<ApiResponse<AdminPost>>(`${this.apiBase}/api/admin/posts/${postId}/unfeature`, {}, {
      withCredentials: true,
    });
  }
}
