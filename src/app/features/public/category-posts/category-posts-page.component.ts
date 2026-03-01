import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { PublicCategory, PublicCategoriesService } from '../../../core/services/public-categories.service';
import { PublicPost } from '../../../core/services/public-posts.service';
import { PublicTopbarComponent } from '../shared/public-topbar.component';

@Component({
  selector: 'app-category-posts-page',
  imports: [CommonModule, RouterLink, MatCardModule, PublicTopbarComponent],
  templateUrl: './category-posts-page.component.html',
  styleUrl: './category-posts-page.component.scss',
})
export class CategoryPostsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly categoriesService = inject(PublicCategoriesService);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly category = signal<PublicCategory | null>(null);
  readonly posts = signal<PublicPost[]>([]);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');

      if (!slug) {
        this.errorMessage.set('Categoria não encontrada.');
        this.category.set(null);
        this.posts.set([]);
        this.isLoading.set(false);
        return;
      }

      this.loadCategoryPosts(slug);
    });
  }

  private loadCategoryPosts(slug: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.categoriesService.postsBySlug(slug).subscribe({
      next: (response) => {
        this.category.set(response.data.category);
        this.posts.set(response.data.posts.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar as notícias da categoria.');
        this.category.set(null);
        this.posts.set([]);
        this.isLoading.set(false);
      },
    });
  }
}
