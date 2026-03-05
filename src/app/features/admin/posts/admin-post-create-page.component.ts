import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { startWith } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AngularEditorConfig, AngularEditorModule } from '@kolkov/angular-editor';
import { AdminPostsService, PostCoverMedia } from '../../../core/services/admin-posts.service';
import { AdminCategoriesService, AdminCategory } from '../../../core/services/admin-categories.service';
import { AdminMedia, AdminMediaService } from '../../../core/services/admin-media.service';
import { AdminShellComponent } from '../shared/admin-shell.component';
import { compressImageFile } from '../../../core/utils/image-compression.util';

@Component({
  selector: 'app-admin-post-create-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AdminShellComponent,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    AngularEditorModule,
  ],
  templateUrl: './admin-post-create-page.component.html',
  styleUrl: './admin-post-create-page.component.scss',
})
export class AdminPostCreatePageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly postsService = inject(AdminPostsService);
  private readonly categoriesService = inject(AdminCategoriesService);
  private readonly mediaService = inject(AdminMediaService);

  readonly isSubmitting = signal(false);
  readonly isLoading = signal(false);
  readonly isUploadingCover = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly uploadOptimizationMessage = signal<string | null>(null);
  readonly categories = signal<AdminCategory[]>([]);
  readonly selectedCover = signal<AdminMedia | PostCoverMedia | null>(null);
  readonly editingPostId = signal<number | null>(null);
  readonly coverFocusX = signal(50);
  readonly coverFocusY = signal(50);
  readonly coverZoom = signal(1);
  readonly isDraggingCover = signal(false);
  readonly coverObjectPosition = computed(() => `${this.coverFocusX()}% ${this.coverFocusY()}%`);
  readonly coverTransform = computed(() => `scale(${this.coverZoom()})`);
  readonly coverObjectFit = computed(() => (this.coverZoom() > 1 ? 'cover' : 'contain'));

  private activePointerId: number | null = null;
  private lastPointerX = 0;
  private lastPointerY = 0;

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    subtitle: ['', [Validators.maxLength(255)]],
    slug: [''],
    content: ['', [Validators.required]],
    category_id: [null as number | null],
    cover_media_id: [null as number | null],
    cover_focus_x: [50],
    cover_focus_y: [50],
    cover_zoom: [1],
  });

  readonly editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    minHeight: '280px',
    placeholder: 'Escreva o conteúdo completo da notícia...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    sanitize: true,
  };

  private readonly formValue = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  readonly previewTitle = computed(() => this.formValue().title || 'Título da notícia');
  readonly previewSubtitle = computed(() => this.formValue().subtitle || 'Subtítulo da publicação');
  readonly previewContent = computed(() => this.formValue().content || '<p>O conteúdo aparecerá aqui na prévia.</p>');
  readonly isEditMode = computed(() => this.editingPostId() !== null);
  readonly pageTitle = computed(() => (this.isEditMode() ? 'Editar publicação' : 'Nova publicação'));
  readonly pageSubtitle = computed(() =>
    this.isEditMode()
      ? 'Atualize os dados da notícia e revise a prévia antes de salvar.'
      : 'Crie uma notícia e revise a prévia antes de salvar.',
  );

  ngOnInit(): void {
    const postId = Number.parseInt(this.route.snapshot.paramMap.get('id') ?? '', 10);

    if (Number.isFinite(postId) && postId > 0) {
      this.editingPostId.set(postId);
      this.loadPost(postId);
    }

    this.loadCategories();
  }

  loadPost(postId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.postsService.show(postId).subscribe({
      next: (response) => {
        const post = response.data;

        this.form.patchValue({
          title: post.title,
          subtitle: post.subtitle ?? '',
          slug: post.slug,
          content: post.content,
          category_id: post.category_id,
          cover_media_id: post.cover_media?.id ?? null,
          cover_focus_x: post.cover_focus_x ?? 50,
          cover_focus_y: post.cover_focus_y ?? 50,
          cover_zoom: post.cover_zoom ?? 1,
        });

        this.selectedCover.set(post.cover_media ?? null);
        this.coverFocusX.set(post.cover_focus_x ?? 50);
        this.coverFocusY.set(post.cover_focus_y ?? 50);
        this.coverZoom.set(post.cover_zoom ?? 1);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar a notícia para edição.');
        this.isLoading.set(false);
      },
    });
  }

  loadCategories(): void {
    this.errorMessage.set(null);

    this.categoriesService.list().subscribe({
      next: (response) => {
        this.categories.set(response.data);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar categorias.');
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

    const postId = this.editingPostId();
    const payload = {
      ...this.form.getRawValue(),
      cover_focus_x: this.coverFocusX(),
      cover_focus_y: this.coverFocusY(),
      cover_zoom: this.coverZoom(),
      status: 'published' as const,
    };

    const request$ = postId !== null
      ? this.postsService.update(postId, payload)
      : this.postsService.create(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        void this.router.navigate(['/admin/posts']);
      },
      error: () => {
        this.errorMessage.set('Não foi possível salvar a notícia.');
        this.isSubmitting.set(false);
      },
    });
  }

  async onCoverFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file || this.isUploadingCover()) {
      return;
    }

    this.errorMessage.set(null);
    this.isUploadingCover.set(true);

    try {
      const compressedFile = await compressImageFile(file);

      if (compressedFile.size < file.size) {
        this.uploadOptimizationMessage.set(
          `Imagem otimizada: ${this.formatSize(file.size)} → ${this.formatSize(compressedFile.size)}.`,
        );
      } else {
        this.uploadOptimizationMessage.set(null);
      }

      const response = await firstValueFrom(this.mediaService.upload(compressedFile));

      this.selectedCover.set(response.data);
      this.form.patchValue({
        cover_media_id: response.data.id,
        cover_focus_x: this.coverFocusX(),
        cover_focus_y: this.coverFocusY(),
        cover_zoom: this.coverZoom(),
      });
      input.value = '';
    } catch {
      this.errorMessage.set('Não foi possível enviar a imagem de capa.');
    } finally {
      this.isUploadingCover.set(false);
    }
  }

  resetCoverPosition(): void {
    this.coverFocusX.set(50);
    this.coverFocusY.set(50);
    this.coverZoom.set(1);
    this.syncCoverControls();
  }

  adjustCoverZoom(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const value = Number(target?.value ?? 1);

    if (!Number.isFinite(value)) {
      return;
    }

    this.coverZoom.set(this.clampZoom(value));
    this.syncCoverControls();
  }

  startCoverDrag(event: PointerEvent): void {
    if (!this.selectedCover()) {
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
    this.syncCoverControls();
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

  private syncCoverControls(): void {
    this.form.patchValue({
      cover_focus_x: this.coverFocusX(),
      cover_focus_y: this.coverFocusY(),
      cover_zoom: this.coverZoom(),
    }, { emitEvent: false });
  }

  private clampPercent(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  private clampZoom(value: number): number {
    return Math.max(0.5, Math.min(2, Math.round(value * 100) / 100));
  }

  private formatSize(sizeInBytes: number): string {
    const sizeInMegabytes = sizeInBytes / (1024 * 1024);

    return `${sizeInMegabytes.toFixed(1)} MB`;
  }
}
