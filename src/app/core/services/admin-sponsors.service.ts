import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminMedia } from './admin-media.service';
import { API_BASE_URL } from '../config/app-endpoints';

export type SponsorStatus = 'active' | 'inactive';

export interface AdminSponsor {
  id: number;
  name: string;
  destination_url: string;
  image_media_id: number;
  placement: 'footer';
  status: SponsorStatus;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  image?: AdminMedia;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface CreateSponsorPayload {
  name: string;
  destination_url: string;
  image_media_id: number;
  placement?: 'footer';
  status?: SponsorStatus;
}

@Injectable({ providedIn: 'root' })
export class AdminSponsorsService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = API_BASE_URL;

  list(): Observable<ApiResponse<AdminSponsor[]>> {
    return this.http.get<ApiResponse<AdminSponsor[]>>(`${this.apiBase}/api/admin/sponsors`, {
      withCredentials: true,
    });
  }

  create(payload: CreateSponsorPayload): Observable<ApiResponse<AdminSponsor>> {
    return this.http.post<ApiResponse<AdminSponsor>>(`${this.apiBase}/api/admin/sponsors`, payload, {
      withCredentials: true,
    });
  }

  remove(sponsorId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiBase}/api/admin/sponsors/${sponsorId}`, {
      withCredentials: true,
    });
  }
}
