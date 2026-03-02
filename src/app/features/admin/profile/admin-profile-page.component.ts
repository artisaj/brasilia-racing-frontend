import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AdminShellComponent } from '../shared/admin-shell.component';
import { AdminAuthService, AdminUser } from '../../../core/services/admin-auth.service';
import { AdminProfileService } from '../../../core/services/admin-profile.service';

@Component({
  selector: 'app-admin-profile-page',
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
  ],
  templateUrl: './admin-profile-page.component.html',
  styleUrl: './admin-profile-page.component.scss',
})
export class AdminProfilePageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly profileService = inject(AdminProfileService);
  private readonly authService = inject(AdminAuthService);

  readonly profile = signal<AdminUser | null>(null);
  readonly isLoadingProfile = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    current_password: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoadingProfile.set(true);
    this.profileService.me().subscribe({
      next: (response) => {
        this.profile.set(response.data);
        this.isLoadingProfile.set(false);
      },
      error: () => {
        this.isLoadingProfile.set(false);
      },
    });
  }

  updatePassword(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const { password, password_confirmation } = this.form.getRawValue();

    if (password !== password_confirmation) {
      this.errorMessage.set('A nova senha e a confirmação precisam ser iguais.');
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isSubmitting.set(true);

    this.profileService.updatePassword(this.form.getRawValue()).subscribe({
      next: () => {
        this.successMessage.set('Senha atualizada com sucesso.');
        this.form.reset({ current_password: '', password: '', password_confirmation: '' });
        this.isSubmitting.set(false);
        this.authService.me().subscribe();
      },
      error: () => {
        this.errorMessage.set('Não foi possível atualizar a senha. Verifique a senha atual.');
        this.isSubmitting.set(false);
      },
    });
  }
}
