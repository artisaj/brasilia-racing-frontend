import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminMedia {
  id: number;
  type: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  original_url: string;
  thumb_url: string;
  card_url: string;
  hero_url: string;
  full_url: string;
  created_at: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminMediaService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://localhost:8000';

  list(): Observable<PaginatedResponse<AdminMedia>> {
    return this.http.get<PaginatedResponse<AdminMedia>>(`${this.apiBase}/api/admin/media`, {
      withCredentials: true,
    });
  }

  upload(file: File): Observable<ApiResponse<AdminMedia>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<AdminMedia>>(`${this.apiBase}/api/admin/media/upload`, formData, {
      withCredentials: true,
    });
  }
}
