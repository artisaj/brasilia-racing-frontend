import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PublicPost, PublicPostsService } from '../../../core/services/public-posts.service';
import { PublicTopbarComponent } from '../shared/public-topbar.component';
import { ImageViewerComponent } from '../../../shared/components/image-viewer/image-viewer.component';
import { PublicComment, PublicCommentsService } from '../../../core/services/public-comments.service';

@Component({
  selector: 'app-post-detail-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    PublicTopbarComponent,
    ImageViewerComponent,
  ],
  templateUrl: './post-detail-page.component.html',
  styleUrl: './post-detail-page.component.scss',
})
export class PostDetailPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly postsService = inject(PublicPostsService);
  private readonly commentsService = inject(PublicCommentsService);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly post = signal<PublicPost | null>(null);
  readonly comments = signal<PublicComment[]>([]);
  readonly commentsLoading = signal(false);
  readonly commentErrorMessage = signal<string | null>(null);
  readonly commentSuccessMessage = signal<string | null>(null);
  readonly isSubmittingComment = signal(false);

  readonly commentForm = this.formBuilder.nonNullable.group({
    author_name: ['', [Validators.required, Validators.maxLength(255)]],
    author_email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    body: ['', [Validators.required, Validators.maxLength(2000)]],
  });

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

    this.loadComments(slug);
  }

  submitComment(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
      return;
    }

    if (this.commentForm.invalid || this.isSubmittingComment()) {
      this.commentForm.markAllAsTouched();
      return;
    }

    this.isSubmittingComment.set(true);
    this.commentErrorMessage.set(null);
    this.commentSuccessMessage.set(null);

    this.commentsService.create(slug, {
      ...this.commentForm.getRawValue(),
      recaptcha_token: 'public-site',
    }).subscribe({
      next: () => {
        this.isSubmittingComment.set(false);
        this.commentForm.reset({
          author_name: '',
          author_email: '',
          body: '',
        });
        this.commentSuccessMessage.set('Comentário enviado e aguardando moderação.');
      },
      error: (error) => {
        const apiMessage = error?.error?.message as string | undefined;
        this.commentErrorMessage.set(apiMessage || 'Não foi possível enviar o comentário.');
        this.isSubmittingComment.set(false);
      },
    });
  }

  private loadComments(slug: string): void {
    this.commentsLoading.set(true);
    this.commentErrorMessage.set(null);

    this.commentsService.listByPostSlug(slug).subscribe({
      next: (response) => {
        this.comments.set(response.data);
        this.commentsLoading.set(false);
      },
      error: () => {
        this.commentErrorMessage.set('Não foi possível carregar os comentários.');
        this.commentsLoading.set(false);
      },
    });
  }
}
