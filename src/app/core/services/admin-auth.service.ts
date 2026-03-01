import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'redator';
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://localhost:8000';

  login(payload: LoginPayload): Observable<ApiResponse<AdminUser>> {
    return this.http
      .get(`${this.apiBase}/sanctum/csrf-cookie`, { withCredentials: true })
      .pipe(
        switchMap(() =>
          this.http.post<ApiResponse<AdminUser>>(`${this.apiBase}/api/admin/auth/login`, payload, {
            withCredentials: true,
          })
        )
      );
  }

  me(): Observable<ApiResponse<AdminUser>> {
    return this.http.get<ApiResponse<AdminUser>>(`${this.apiBase}/api/admin/auth/me`, {
      withCredentials: true,
    });
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiBase}/api/admin/auth/logout`,
      {},
      { withCredentials: true }
    );
  }
}
