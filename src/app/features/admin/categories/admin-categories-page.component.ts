import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { AdminCategoriesService, AdminCategory } from '../../../core/services/admin-categories.service';

@Component({
  selector: 'app-admin-categories-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
  ],
  templateUrl: './admin-categories-page.component.html',
  styleUrl: './admin-categories-page.component.scss',
})
export class AdminCategoriesPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly categoriesService = inject(AdminCategoriesService);

  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly categories = signal<AdminCategory[]>([]);
  readonly displayedColumns = ['id', 'name', 'slug', 'posts_count', 'actions'];

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    slug: [''],
    description: ['', [Validators.maxLength(255)]],
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.categoriesService.list().subscribe({
      next: (response) => {
        this.categories.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar categorias.');
        this.isLoading.set(false);
      },
    });
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    this.categoriesService.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.form.reset({ name: '', slug: '', description: '' });
        this.isSubmitting.set(false);
        this.loadCategories();
      },
      error: () => {
        this.errorMessage.set('Não foi possível salvar a categoria.');
        this.isSubmitting.set(false);
      },
    });
  }

  remove(category: AdminCategory): void {
    this.errorMessage.set(null);

    this.categoriesService.delete(category.id).subscribe({
      next: () => {
        this.loadCategories();
      },
      error: (error) => {
        const message = error?.error?.message ?? 'Não foi possível remover a categoria.';
        this.errorMessage.set(message);
      },
    });
  }
}
