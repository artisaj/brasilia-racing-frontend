import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { AdminShellComponent } from '../shared/admin-shell.component';
import {
  AdminComment,
  AdminCommentsService,
  CommentStatus,
} from '../../../core/services/admin-comments.service';

@Component({
  selector: 'app-admin-comments-page',
  imports: [
    CommonModule,
    RouterLink,
    AdminShellComponent,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatSelectModule,
  ],
  templateUrl: './admin-comments-page.component.html',
  styleUrl: './admin-comments-page.component.scss',
})
export class AdminCommentsPageComponent implements OnInit {
  private readonly commentsService = inject(AdminCommentsService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly comments = signal<AdminComment[]>([]);
  readonly status = signal<CommentStatus>('pending');
  readonly displayedColumns = ['id', 'post', 'author', 'body', 'status', 'created_at', 'actions'];

  ngOnInit(): void {
    this.loadComments();
  }

  onStatusChange(nextStatus: string): void {
    this.status.set((nextStatus as CommentStatus) ?? 'pending');
    this.loadComments();
  }

  loadComments(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.commentsService.list(this.status()).subscribe({
      next: (response) => {
        this.comments.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar comentários.');
        this.isLoading.set(false);
      },
    });
  }

  approve(comment: AdminComment): void {
    this.commentsService.approve(comment.id).subscribe({
      next: () => this.loadComments(),
      error: () => this.errorMessage.set('Não foi possível aprovar comentário.'),
    });
  }

  reject(comment: AdminComment): void {
    this.commentsService.reject(comment.id).subscribe({
      next: () => this.loadComments(),
      error: () => this.errorMessage.set('Não foi possível rejeitar comentário.'),
    });
  }

  remove(comment: AdminComment): void {
    this.commentsService.remove(comment.id).subscribe({
      next: () => this.loadComments(),
      error: () => this.errorMessage.set('Não foi possível remover comentário.'),
    });
  }
}
