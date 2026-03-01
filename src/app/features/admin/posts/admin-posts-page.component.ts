import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { AdminPost, AdminPostsService } from '../../../core/services/admin-posts.service';
import { AdminShellComponent } from '../shared/admin-shell.component';

@Component({
  selector: 'app-admin-posts-page',
  imports: [
    CommonModule,
    RouterLink,
    AdminShellComponent,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatMenuModule,
  ],
  templateUrl: './admin-posts-page.component.html',
  styleUrl: './admin-posts-page.component.scss',
})
export class AdminPostsPageComponent implements OnInit {
  private readonly postsService = inject(AdminPostsService);

  readonly isLoading = signal(false);
  readonly isHighlighting = signal<number | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly posts = signal<AdminPost[]>([]);
  readonly currentPage = signal(1);
  readonly lastPage = signal(1);
  readonly totalItems = signal(0);
  readonly displayedColumns: string[] = ['id', 'title', 'featured', 'category', 'status', 'author', 'created_at', 'actions'];

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(page = this.currentPage()): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.postsService.list(page, 12).subscribe({
      next: (response) => {
        this.posts.set(response.data);
        this.currentPage.set(response.current_page);
        this.lastPage.set(response.last_page);
        this.totalItems.set(response.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar notícias. Faça login novamente.');
        this.isLoading.set(false);
      },
    });
  }

  nextPage(): void {
    if (this.currentPage() >= this.lastPage()) {
      return;
    }

    this.loadPosts(this.currentPage() + 1);
  }

  previousPage(): void {
    if (this.currentPage() <= 1) {
      return;
    }

    this.loadPosts(this.currentPage() - 1);
  }

  setFeatured(post: AdminPost): void {
    if (this.isHighlighting() !== null) {
      return;
    }

    this.errorMessage.set(null);
    this.isHighlighting.set(post.id);

    this.postsService.feature(post.id).subscribe({
      next: () => {
        this.isHighlighting.set(null);
        this.loadPosts();
      },
      error: () => {
        this.errorMessage.set('Não foi possível definir notícia em destaque.');
        this.isHighlighting.set(null);
      },
    });
  }

  removeFeatured(post: AdminPost): void {
    if (this.isHighlighting() !== null) {
      return;
    }

    this.errorMessage.set(null);
    this.isHighlighting.set(post.id);

    this.postsService.unfeature(post.id).subscribe({
      next: () => {
        this.isHighlighting.set(null);
        this.loadPosts();
      },
      error: () => {
        this.errorMessage.set('Não foi possível remover destaque da notícia.');
        this.isHighlighting.set(null);
      },
    });
  }

  remove(post: AdminPost): void {
    const confirmed = globalThis.confirm(`Excluir a notícia "${post.title}"?`);

    if (!confirmed) {
      return;
    }

    this.errorMessage.set(null);

    this.postsService.remove(post.id).subscribe({
      next: () => {
        this.loadPosts();
      },
      error: () => {
        this.errorMessage.set('Não foi possível excluir a notícia.');
      },
    });
  }
}
