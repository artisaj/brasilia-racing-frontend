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
import { AdminPost, AdminPostsService } from '../../../core/services/admin-posts.service';

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
    MatTableModule,
  ],
  templateUrl: './admin-posts-page.component.html',
  styleUrl: './admin-posts-page.component.scss',
})
export class AdminPostsPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly postsService = inject(AdminPostsService);

  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly posts = signal<AdminPost[]>([]);
  readonly displayedColumns: string[] = ['id', 'title', 'status', 'author', 'created_at'];

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    subtitle: ['', [Validators.maxLength(255)]],
    slug: [''],
    content: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadPosts();
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
          this.form.reset({ title: '', subtitle: '', slug: '', content: '' });
          this.isSubmitting.set(false);
          this.loadPosts();
        },
        error: () => {
          this.errorMessage.set('Não foi possível salvar a notícia.');
          this.isSubmitting.set(false);
        },
      });
  }
}
