import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { PublicPost, PublicPostsService } from '../../../core/services/public-posts.service';
import { PublicTopbarComponent } from '../shared/public-topbar.component';
import { ImageViewerComponent } from '../../../shared/components/image-viewer/image-viewer.component';

@Component({
  selector: 'app-post-detail-page',
  imports: [CommonModule, MatCardModule, PublicTopbarComponent, ImageViewerComponent],
  templateUrl: './post-detail-page.component.html',
  styleUrl: './post-detail-page.component.scss',
})
export class PostDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly postsService = inject(PublicPostsService);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly post = signal<PublicPost | null>(null);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
      this.errorMessage.set('Notícia não encontrada.');
      this.isLoading.set(false);
      return;
    }

    this.postsService.show(slug).subscribe({
      next: (response) => {
        this.post.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar a notícia.');
        this.isLoading.set(false);
      },
    });
  }
}
