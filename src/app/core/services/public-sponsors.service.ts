import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/app-endpoints';

export interface PublicSponsor {
  id: number;
  name: string;
  destination_url: string;
  placement: 'footer';
  status: 'active' | 'inactive';
  image?: {
    id: number;
    card_url: string;
    full_url: string;
    thumb_url: string;
  };
}

interface ApiResponse<T> {
  data: T;
}

@Injectable({ providedIn: 'root' })
export class PublicSponsorsService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = API_BASE_URL;

  listFooter(): Observable<ApiResponse<PublicSponsor[]>> {
    return this.http.get<ApiResponse<PublicSponsor[]>>(
      `${this.apiBase}/api/public/sponsors?placement=footer`
    );
  }
}
