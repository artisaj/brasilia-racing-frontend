import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AdminAuditLog, AdminAuditLogsService } from '../../../core/services/admin-audit-logs.service';

@Component({
  selector: 'app-admin-audit-logs-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './admin-audit-logs-page.component.html',
  styleUrl: './admin-audit-logs-page.component.scss',
})
export class AdminAuditLogsPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auditLogsService = inject(AdminAuditLogsService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly logs = signal<AdminAuditLog[]>([]);
  readonly displayedColumns = ['id', 'action', 'user', 'request_id', 'resource', 'created_at'];

  readonly filtersForm = this.formBuilder.nonNullable.group({
    action: '',
    user_id: '',
    request_id: '',
  });

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { action, user_id, request_id } = this.filtersForm.getRawValue();

    this.auditLogsService
      .list({
        action,
        user_id,
        request_id,
        per_page: 50,
      })
      .subscribe({
        next: (response) => {
          this.logs.set(response.data);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Não foi possível carregar os logs de auditoria.');
          this.isLoading.set(false);
        },
      });
  }

  applyFilters(): void {
    this.loadLogs();
  }

  clearFilters(): void {
    this.filtersForm.reset({
      action: '',
      user_id: '',
      request_id: '',
    });

    this.loadLogs();
  }

  resourceLabel(log: AdminAuditLog): string {
    if (!log.auditable_type || !log.auditable_id) {
      return '-';
    }

    const typeParts = log.auditable_type.split('\\');
    const shortType = typeParts[typeParts.length - 1] ?? log.auditable_type;

    return `${shortType} #${log.auditable_id}`;
  }
}
