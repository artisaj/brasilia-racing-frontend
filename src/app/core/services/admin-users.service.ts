import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/app-endpoints';

export type AdminUserRole = 'admin' | 'redator';
export type AdminUserStatus = 'pending' | 'active' | 'inactive';

export interface ManagedUser {
  id: number;
  name: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  created_at: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = API_BASE_URL;

  list(): Observable<ApiResponse<ManagedUser[]>> {
    return this.http.get<ApiResponse<ManagedUser[]>>(`${this.apiBase}/api/admin/users`, {
      withCredentials: true,
    });
  }

  create(payload: {
    name: string;
    email: string;
    role: AdminUserRole;
    status: AdminUserStatus;
  }): Observable<ApiResponse<ManagedUser>> {
    return this.http.post<ApiResponse<ManagedUser>>(`${this.apiBase}/api/admin/users`, payload, {
      withCredentials: true,
    });
  }

  update(
    userId: number,
    payload: {
      name: string;
      email: string;
      role: AdminUserRole;
      status: AdminUserStatus;
    }
  ): Observable<ApiResponse<ManagedUser>> {
    return this.http.put<ApiResponse<ManagedUser>>(`${this.apiBase}/api/admin/users/${userId}`, payload, {
      withCredentials: true,
    });
  }

  remove(userId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiBase}/api/admin/users/${userId}`, {
      withCredentials: true,
    });
  }

  updateStatus(userId: number, status: AdminUserStatus): Observable<ApiResponse<ManagedUser>> {
    return this.http.patch<ApiResponse<ManagedUser>>(
      `${this.apiBase}/api/admin/users/${userId}/status`,
      { status },
      { withCredentials: true }
    );
  }
}
