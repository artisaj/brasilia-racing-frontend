import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AdminShellComponent } from '../shared/admin-shell.component';
import { AdminPost, AdminPostsService } from '../../../core/services/admin-posts.service';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [CommonModule, AdminShellComponent, MatCardModule, MatButtonModule, RouterLink],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrl: './admin-dashboard-page.component.scss'
})
export class AdminDashboardPageComponent {
  private readonly postsService = inject(AdminPostsService);

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly isModalOpen = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly featuredPosts = signal<AdminPost[]>([]);
  readonly availablePosts = signal<AdminPost[]>([]);

  constructor() {
    this.loadFeaturedPosts();
  }

  loadFeaturedPosts(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.postsService.listFeatured().subscribe({
      next: (response) => {
        this.featuredPosts.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os destaques.');
        this.isLoading.set(false);
      },
    });
  }

  openAddModal(): void {
    this.isModalOpen.set(true);
    this.loadAvailablePosts();
  }

  closeAddModal(): void {
    this.isModalOpen.set(false);
  }

  loadAvailablePosts(): void {
    this.postsService.list(1, 100).subscribe({
      next: (response) => {
        const featuredIds = new Set(this.featuredPosts().map((post) => post.id));

        this.availablePosts.set(
          response.data.filter((post) => post.status === 'published' && !featuredIds.has(post.id)),
        );
      },
      error: () => {
        this.availablePosts.set([]);
      },
    });
  }

  addToFeatured(post: AdminPost): void {
    if (this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.postsService.feature(post.id).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeAddModal();
        this.loadFeaturedPosts();
      },
      error: () => {
        this.errorMessage.set('Não foi possível adicionar a notícia aos destaques.');
        this.isSaving.set(false);
      },
    });
  }

  removeFromFeatured(post: AdminPost): void {
    if (this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.postsService.unfeature(post.id).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.loadFeaturedPosts();
      },
      error: () => {
        this.errorMessage.set('Não foi possível remover o destaque.');
        this.isSaving.set(false);
      },
    });
  }

  moveFeatured(index: number, direction: -1 | 1): void {
    if (this.isSaving()) {
      return;
    }

    const posts = [...this.featuredPosts()];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= posts.length) {
      return;
    }

    const [moved] = posts.splice(index, 1);
    posts.splice(targetIndex, 0, moved);

    this.featuredPosts.set(posts);
    this.persistFeaturedOrder(posts);
  }

  private persistFeaturedOrder(posts: AdminPost[]): void {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.postsService.reorderFeatured({ post_ids: posts.map((post) => post.id) }).subscribe({
      next: (response) => {
        this.featuredPosts.set(response.data);
        this.isSaving.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível atualizar a ordem dos destaques.');
        this.isSaving.set(false);
        this.loadFeaturedPosts();
      },
    });
  }
}
