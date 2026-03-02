import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { AdminShellComponent } from '../shared/admin-shell.component';
import {
  AdminUserRole,
  AdminUserStatus,
  AdminUsersService,
  ManagedUser,
} from '../../../core/services/admin-users.service';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AdminShellComponent,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
  ],
  templateUrl: './admin-users-page.component.html',
  styleUrl: './admin-users-page.component.scss',
})
export class AdminUsersPageComponent implements OnInit {
  private readonly usersService = inject(AdminUsersService);
  private readonly formBuilder = inject(FormBuilder);

  readonly users = signal<ManagedUser[]>([]);
  readonly isLoading = signal(false);
  readonly isCreating = signal(false);
  readonly isSavingEdit = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly displayedColumns = ['id', 'email', 'name', 'role', 'created_at', 'actions'];
  readonly isCreateModalOpen = signal(false);
  readonly isEditModalOpen = signal(false);
  readonly selectedUserId = signal<number | null>(null);

  readonly createForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    role: ['admin' as AdminUserRole, [Validators.required]],
    status: ['pending' as AdminUserStatus, [Validators.required]],
  });

  readonly editForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    role: ['admin' as AdminUserRole, [Validators.required]],
    status: ['pending' as AdminUserStatus, [Validators.required]],
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.usersService.list().subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar usuários.');
        this.isLoading.set(false);
      },
    });
  }

  createUser(): void {
    if (this.createForm.invalid || this.isCreating()) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isCreating.set(true);

    this.usersService.create(this.createForm.getRawValue()).subscribe({
      next: (response) => {
        this.successMessage.set(response.message ?? 'Usuário criado com sucesso.');
        this.createForm.reset({
          name: '',
          email: '',
          role: 'admin',
          status: 'pending',
        });
        this.isCreating.set(false);
        this.closeCreateModal();
        this.loadUsers();
      },
      error: () => {
        this.errorMessage.set('Não foi possível criar usuário.');
        this.isCreating.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.createForm.reset({
      name: '',
      email: '',
      role: 'admin',
      status: 'pending',
    });
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  updateStatus(user: ManagedUser, status: string): void {
    const nextStatus = (status as AdminUserStatus) ?? user.status;

    if (nextStatus === user.status) {
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.usersService.updateStatus(user.id, nextStatus).subscribe({
      next: (response) => {
        this.successMessage.set(response.message ?? 'Status atualizado com sucesso.');
        this.loadUsers();
      },
      error: () => {
        this.errorMessage.set('Não foi possível atualizar status do usuário.');
      },
    });
  }

  openEditModal(user: ManagedUser): void {
    this.selectedUserId.set(user.id);
    this.editForm.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.selectedUserId.set(null);
    this.editForm.reset({
      name: '',
      email: '',
      role: 'admin',
      status: 'pending',
    });
  }

  saveEdit(): void {
    if (this.editForm.invalid || this.isSavingEdit()) {
      this.editForm.markAllAsTouched();
      return;
    }

    const userId = this.selectedUserId();

    if (!userId) {
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isSavingEdit.set(true);

    this.usersService.update(userId, this.editForm.getRawValue()).subscribe({
      next: (response) => {
        this.successMessage.set(response.message ?? 'Usuário atualizado com sucesso.');
        this.isSavingEdit.set(false);
        this.closeEditModal();
        this.loadUsers();
      },
      error: () => {
        this.errorMessage.set('Não foi possível atualizar usuário.');
        this.isSavingEdit.set(false);
      },
    });
  }

  removeUser(user: ManagedUser): void {
    const shouldRemove = confirm(`Excluir usuário ${user.email}?`);

    if (!shouldRemove) {
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.usersService.remove(user.id).subscribe({
      next: (response) => {
        this.successMessage.set(response.message ?? 'Usuário excluído com sucesso.');
        this.loadUsers();
      },
      error: () => {
        this.errorMessage.set('Não foi possível excluir usuário.');
      },
    });
  }
}
