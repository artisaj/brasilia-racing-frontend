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
import { MatSelectModule } from '@angular/material/select';
import { AdminPost, AdminPostsService } from '../../../core/services/admin-posts.service';
import { AdminCategoriesService, AdminCategory } from '../../../core/services/admin-categories.service';
import { AdminMedia, AdminMediaService } from '../../../core/services/admin-media.service';

@Component({
  selector: 'app-admin-posts-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './admin-posts-page.component.html',
  styleUrl: './admin-posts-page.component.scss',
})
export class AdminPostsPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly postsService = inject(AdminPostsService);
  private readonly categoriesService = inject(AdminCategoriesService);
  private readonly mediaService = inject(AdminMediaService);

  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly posts = signal<AdminPost[]>([]);
  readonly categories = signal<AdminCategory[]>([]);
  readonly selectedCover = signal<AdminMedia | null>(null);
  readonly isUploadingCover = signal(false);
  readonly displayedColumns: string[] = ['id', 'title', 'category', 'status', 'author', 'cover', 'created_at'];

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    subtitle: ['', [Validators.maxLength(255)]],
    slug: [''],
    content: ['', [Validators.required]],
    category_id: [null as number | null],
    cover_media_id: [null as number | null],
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadPosts();
  }

  loadCategories(): void {
    this.categoriesService.list().subscribe({
      next: (response) => {
        this.categories.set(response.data);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar categorias.');
      },
    });
  }

  loadPosts(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.postsService.list().subscribe({
      next: (response) => {
        this.posts.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar notícias. Faça login novamente.');
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

    this.postsService
      .create({
        ...this.form.getRawValue(),
        status: 'draft',
      })
      .subscribe({
        next: () => {
          this.form.reset({
            title: '',
            subtitle: '',
            slug: '',
            content: '',
            category_id: null,
            cover_media_id: null,
          });
          this.selectedCover.set(null);
          this.isSubmitting.set(false);
          this.loadPosts();
        },
        error: () => {
          this.errorMessage.set('Não foi possível salvar a notícia.');
          this.isSubmitting.set(false);
        },
      });
  }

  onCoverFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file || this.isUploadingCover()) {
      return;
    }

    this.errorMessage.set(null);
    this.isUploadingCover.set(true);

    this.mediaService.upload(file).subscribe({
      next: (response) => {
        this.selectedCover.set(response.data);
        this.form.patchValue({ cover_media_id: response.data.id });
        this.isUploadingCover.set(false);
        input.value = '';
      },
      error: () => {
        this.errorMessage.set('Não foi possível enviar a imagem de capa.');
        this.isUploadingCover.set(false);
      },
    });
  }
}
