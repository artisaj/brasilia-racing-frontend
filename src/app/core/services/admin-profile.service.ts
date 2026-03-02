import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/app-endpoints';
import { AdminUser } from './admin-auth.service';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = API_BASE_URL;

  me(): Observable<ApiResponse<AdminUser>> {
    return this.http.get<ApiResponse<AdminUser>>(`${this.apiBase}/api/admin/profile`, {
      withCredentials: true,
    });
  }

  updatePassword(payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiBase}/api/admin/profile/password`, payload, {
      withCredentials: true,
    });
  }
}
