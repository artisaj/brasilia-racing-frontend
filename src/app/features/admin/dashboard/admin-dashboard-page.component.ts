import { Component, computed, inject, signal } from '@angular/core';
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
  readonly maxFeatured = 5;
  private readonly postsService = inject(AdminPostsService);

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly isModalOpen = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly featuredPosts = signal<AdminPost[]>([]);
  readonly availablePosts = signal<AdminPost[]>([]);
  readonly selectedPostForFeatured = signal<AdminPost | null>(null);
  readonly isEditingFeatured = signal(false);
  readonly coverFocusX = signal(50);
  readonly coverFocusY = signal(50);
  readonly coverZoom = signal(1);
  readonly isDraggingCover = signal(false);
  readonly coverObjectPosition = computed(() => `${this.coverFocusX()}% ${this.coverFocusY()}%`);
  readonly coverTransform = computed(() => `scale(${this.coverZoom()})`);
  readonly canAddFeatured = computed(() => this.featuredPosts().length < this.maxFeatured);

  private activePointerId: number | null = null;
  private lastPointerX = 0;
  private lastPointerY = 0;

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
    if (!this.canAddFeatured()) {
      this.errorMessage.set(`Limite de ${this.maxFeatured} destaques atingido.`);
      return;
    }

    this.isModalOpen.set(true);
    this.isEditingFeatured.set(false);
    this.selectedPostForFeatured.set(null);
    this.loadAvailablePosts();
  }

  closeAddModal(): void {
    this.isModalOpen.set(false);
    this.isEditingFeatured.set(false);
    this.selectedPostForFeatured.set(null);
    this.isDraggingCover.set(false);
    this.activePointerId = null;
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

  openFeaturedEditor(post: AdminPost): void {
    this.isModalOpen.set(true);
    this.startFeatureSetup(post, true);
  }

  startFeatureSetup(post: AdminPost, editingFeatured = false): void {
    this.isEditingFeatured.set(editingFeatured);
    this.selectedPostForFeatured.set(post);
    this.coverFocusX.set(post.cover_focus_x ?? 50);
    this.coverFocusY.set(post.cover_focus_y ?? 50);
    this.coverZoom.set(post.cover_zoom ?? 1);
  }

  backToAvailablePosts(): void {
    this.isEditingFeatured.set(false);
    this.selectedPostForFeatured.set(null);
    this.isDraggingCover.set(false);
    this.activePointerId = null;
  }

  exitFeatureSetup(): void {
    if (this.isEditingFeatured()) {
      this.closeAddModal();
      return;
    }

    this.backToAvailablePosts();
  }

  resetCoverPosition(): void {
    this.coverFocusX.set(50);
    this.coverFocusY.set(50);
    this.coverZoom.set(1);
  }

  adjustCoverZoom(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const value = Number(target?.value ?? 1);

    if (!Number.isFinite(value)) {
      return;
    }

    this.coverZoom.set(this.clampZoom(value));
  }

  startCoverDrag(event: PointerEvent): void {
    if (!this.selectedPostForFeatured()) {
      return;
    }

    const target = event.currentTarget as HTMLElement | null;

    if (!target) {
      return;
    }

    this.activePointerId = event.pointerId;
    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
    this.isDraggingCover.set(true);
    target.setPointerCapture(event.pointerId);
  }

  onCoverDrag(event: PointerEvent): void {
    if (!this.isDraggingCover() || this.activePointerId !== event.pointerId) {
      return;
    }

    const target = event.currentTarget as HTMLElement | null;

    if (!target) {
      return;
    }

    const rect = target.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }

    const deltaXPercent = ((event.clientX - this.lastPointerX) / rect.width) * 100;
    const deltaYPercent = ((event.clientY - this.lastPointerY) / rect.height) * 100;

    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;

    this.coverFocusX.update((value) => this.clampPercent(value - deltaXPercent));
    this.coverFocusY.update((value) => this.clampPercent(value - deltaYPercent));
  }

  endCoverDrag(event: PointerEvent): void {
    if (this.activePointerId !== event.pointerId) {
      return;
    }

    const target = event.currentTarget as HTMLElement | null;

    if (target?.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }

    this.activePointerId = null;
    this.isDraggingCover.set(false);
  }

  addToFeatured(): void {
    const post = this.selectedPostForFeatured();

    if (!post) {
      return;
    }

    if (this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.postsService.feature(post.id, {
      cover_focus_x: this.coverFocusX(),
      cover_focus_y: this.coverFocusY(),
      cover_zoom: this.coverZoom(),
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeAddModal();
        this.loadFeaturedPosts();
      },
      error: () => {
        this.errorMessage.set(
          this.isEditingFeatured()
            ? 'Não foi possível salvar o enquadramento do destaque.'
            : 'Não foi possível adicionar a notícia aos destaques.',
        );
        this.isSaving.set(false);
      },
    });
  }

  private clampPercent(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  private clampZoom(value: number): number {
    return Math.max(0.5, Math.min(2, Math.round(value * 100) / 100));
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
