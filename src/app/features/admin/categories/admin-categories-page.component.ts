import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { AdminCategoriesService, AdminCategory } from '../../../core/services/admin-categories.service';
import { AdminShellComponent } from '../shared/admin-shell.component';

@Component({
  selector: 'app-admin-categories-page',
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
  readonly displayedColumns = ['id', 'name', 'slug', 'navbar', 'posts_count', 'actions'];

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    slug: [''],
    description: ['', [Validators.maxLength(255)]],
    show_in_navbar: [false],
    navbar_order: [0, [Validators.min(0), Validators.max(999)]],
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
        this.form.reset({ name: '', slug: '', description: '', show_in_navbar: false, navbar_order: 0 });
        this.isSubmitting.set(false);
        this.loadCategories();
      },
      error: () => {
        this.errorMessage.set('Não foi possível salvar a categoria.');
        this.isSubmitting.set(false);
      },
    });
  }

  updateNavbar(category: AdminCategory, showInNavbar: boolean, navbarOrderRaw: string): void {
    this.errorMessage.set(null);
    const parsedOrder = Number.parseInt(navbarOrderRaw, 10);
    const navbarOrder = Number.isNaN(parsedOrder) ? 0 : Math.min(Math.max(parsedOrder, 0), 999);

    this.categoriesService
      .update(category.id, {
        name: category.name,
        slug: category.slug,
        description: category.description ?? undefined,
        show_in_navbar: showInNavbar,
        navbar_order: navbarOrder,
      })
      .subscribe({
        next: () => {
          this.loadCategories();
        },
        error: () => {
          this.errorMessage.set('Não foi possível atualizar exibição da navbar.');
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
