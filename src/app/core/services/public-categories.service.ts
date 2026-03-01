import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/app-endpoints';
import { PublicPost } from './public-posts.service';

export interface PublicCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  show_in_navbar: boolean;
  navbar_order: number;
}

interface ApiResponse<T> {
  data: T;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CategoryPostsPayload {
  category: PublicCategory;
  posts: PaginatedResponse<PublicPost>;
}

@Injectable({ providedIn: 'root' })
export class PublicCategoriesService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = API_BASE_URL;

  listNavbar(): Observable<ApiResponse<PublicCategory[]>> {
    return this.http.get<ApiResponse<PublicCategory[]>>(`${this.apiBase}/api/public/categories`);
  }

  postsBySlug(slug: string): Observable<ApiResponse<CategoryPostsPayload>> {
    return this.http.get<ApiResponse<CategoryPostsPayload>>(`${this.apiBase}/api/public/categories/${slug}/posts`);
  }
}
