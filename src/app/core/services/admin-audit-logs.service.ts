import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminAuditLog {
  id: number;
  user_id: number | null;
  action: string;
  auditable_type: string | null;
  auditable_id: number | null;
  request_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AuditLogFilters {
  action?: string;
  user_id?: string;
  request_id?: string;
  per_page?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminAuditLogsService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://localhost:8000';

  list(filters: AuditLogFilters): Observable<PaginatedResponse<AdminAuditLog>> {
    let params = new HttpParams().set('per_page', String(filters.per_page ?? 30));

    if (filters.action?.trim()) {
      params = params.set('action', filters.action.trim());
    }

    if (filters.user_id?.trim()) {
      params = params.set('user_id', filters.user_id.trim());
    }

    if (filters.request_id?.trim()) {
      params = params.set('request_id', filters.request_id.trim());
    }

    return this.http.get<PaginatedResponse<AdminAuditLog>>(`${this.apiBase}/api/admin/audit-logs`, {
      withCredentials: true,
      params,
    });
  }
}
