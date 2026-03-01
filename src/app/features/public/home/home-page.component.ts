import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PublicSponsor, PublicSponsorsService } from '../../../core/services/public-sponsors.service';
import { PublicPost, PublicPostsService } from '../../../core/services/public-posts.service';
import { PublicTopbarComponent } from '../shared/public-topbar.component';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, MatToolbarModule, MatCardModule, MatButtonModule, RouterLink, PublicTopbarComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit, OnDestroy {
  private readonly sponsorsService = inject(PublicSponsorsService);
  private readonly postsService = inject(PublicPostsService);
  private readonly excerptLimit = 240;
  private readonly htmlTagRegex = /<[^>]+>/;

  readonly sponsors = signal<PublicSponsor[]>([]);
  readonly allPosts = signal<PublicPost[]>([]);
  readonly latestPosts = signal<PublicPost[]>([]);
  readonly posts = signal<PublicPost[]>([]);
  readonly featuredPosts = signal<PublicPost[]>([]);
  readonly featuredIndex = signal(0);
  readonly currentFeatured = computed(() => {
    const items = this.featuredPosts();

    if (items.length === 0) {
      return null;
    }

    const index = this.featuredIndex();
    return items[Math.min(index, items.length - 1)] ?? null;
  });

  private autoRotateTimer: ReturnType<typeof setInterval> | null = null;

  ngOnDestroy(): void {
    this.stopAutoRotate();
  }

  ngOnInit(): void {
    this.postsService.featured().subscribe({
      next: (response) => {
        this.featuredPosts.set(response.data ?? []);
        this.featuredIndex.set(0);
        this.startAutoRotate();
        this.syncVisiblePosts();
      },
      error: () => {
        this.featuredPosts.set([]);
        this.featuredIndex.set(0);
        this.stopAutoRotate();
        this.syncVisiblePosts();
      },
    });

    this.postsService.list(1, 20).subscribe({
      next: (response) => {
        this.allPosts.set(response.data);
        this.syncVisiblePosts();
      },
      error: () => {
        this.allPosts.set([]);
        this.posts.set([]);
      },
    });

    this.sponsorsService.listFooter().subscribe({
      next: (response) => {
        this.sponsors.set(response.data);
      },
      error: () => {
        this.sponsors.set([]);
      },
    });
  }

  private syncVisiblePosts(): void {
    const featuredIds = new Set(this.featuredPosts().map((post) => post.id));
    const visiblePosts = this.allPosts().filter((post) => !featuredIds.has(post.id));
    this.latestPosts.set(visiblePosts.slice(0, 3));
    this.posts.set(visiblePosts);
  }

  previousFeatured(): void {
    const items = this.featuredPosts();

    if (items.length <= 1) {
      return;
    }

    this.featuredIndex.update((current) => (current - 1 + items.length) % items.length);
  }

  nextFeatured(): void {
    const items = this.featuredPosts();

    if (items.length <= 1) {
      return;
    }

    this.featuredIndex.update((current) => (current + 1) % items.length);
  }

  goToFeatured(index: number): void {
    const items = this.featuredPosts();

    if (index < 0 || index >= items.length) {
      return;
    }

    this.featuredIndex.set(index);
  }

  excerpt(post: PublicPost): string {
    const normalized = this.toPlainText(post.content ?? '').replace(/\s+/g, ' ').trim();

    if (normalized.length <= this.excerptLimit) {
      return normalized;
    }

    return `${normalized.slice(0, this.excerptLimit).trimEnd()}…`;
  }

  hasOverflow(post: PublicPost): boolean {
    const normalized = this.toPlainText(post.content ?? '').replace(/\s+/g, ' ').trim();
    return normalized.length > this.excerptLimit;
  }

  private toPlainText(value: string): string {
    const parser = new DOMParser();
    const firstPass = parser.parseFromString(value, 'text/html').body.textContent ?? '';

    if (!this.htmlTagRegex.test(firstPass)) {
      return firstPass;
    }

    return parser.parseFromString(firstPass, 'text/html').body.textContent ?? firstPass;
  }

  private startAutoRotate(): void {
    this.stopAutoRotate();

    if (this.featuredPosts().length <= 1) {
      return;
    }

    this.autoRotateTimer = setInterval(() => {
      this.nextFeatured();
    }, 7000);
  }

  private stopAutoRotate(): void {
    if (this.autoRotateTimer !== null) {
      clearInterval(this.autoRotateTimer);
      this.autoRotateTimer = null;
    }
  }
}
