import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/app-endpoints';

export interface PublicPost {
  id: number;
  title: string;
  subtitle: string | null;
  slug: string;
  content?: string;
  published_at: string | null;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  cover_media?: {
    id: number;
    thumb_url: string;
    card_url: string;
    hero_url: string;
    full_url: string;
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
}

@Injectable({ providedIn: 'root' })
export class PublicPostsService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = API_BASE_URL;

  featured(): Observable<ApiResponse<PublicPost[]>> {
    return this.http.get<ApiResponse<PublicPost[]>>(`${this.apiBase}/api/public/posts/featured`);
  }

  list(page = 1, perPage = 6): Observable<PaginatedResponse<PublicPost>> {
    return this.http.get<PaginatedResponse<PublicPost>>(`${this.apiBase}/api/public/posts`, {
      params: {
        page,
        per_page: perPage,
      },
    });
  }

  show(slug: string): Observable<ApiResponse<PublicPost>> {
    return this.http.get<ApiResponse<PublicPost>>(`${this.apiBase}/api/public/posts/${slug}`);
  }
}
