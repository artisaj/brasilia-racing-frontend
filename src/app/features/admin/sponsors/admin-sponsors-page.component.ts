import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { AdminSponsorsService, AdminSponsor } from '../../../core/services/admin-sponsors.service';
import { AdminMediaService, AdminMedia } from '../../../core/services/admin-media.service';
import { AdminShellComponent } from '../shared/admin-shell.component';

@Component({
  selector: 'app-admin-sponsors-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AdminShellComponent,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
  ],
  templateUrl: './admin-sponsors-page.component.html',
  styleUrl: './admin-sponsors-page.component.scss',
})
export class AdminSponsorsPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly sponsorsService = inject(AdminSponsorsService);
  private readonly mediaService = inject(AdminMediaService);

  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly isUploading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly sponsors = signal<AdminSponsor[]>([]);
  readonly selectedImage = signal<AdminMedia | null>(null);
  readonly editingSponsorId = signal<number | null>(null);
  readonly displayedColumns = ['id', 'name', 'status', 'image', 'actions'];

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    destination_url: ['', [Validators.required]],
    image_media_id: [null as number | null, [Validators.required]],
    status: ['active' as 'active' | 'inactive', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadSponsors();
  }

  loadSponsors(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.sponsorsService.list().subscribe({
      next: (response) => {
        this.sponsors.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar patrocinadores.');
        this.isLoading.set(false);
      },
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file || this.isUploading()) {
      return;
    }

    this.errorMessage.set(null);
    this.isUploading.set(true);

    this.mediaService.upload(file).subscribe({
      next: (response) => {
        this.selectedImage.set(response.data);
        this.form.patchValue({ image_media_id: response.data.id });
        this.isUploading.set(false);
        input.value = '';
      },
      error: () => {
        this.errorMessage.set('Não foi possível enviar a imagem do patrocinador.');
        this.isUploading.set(false);
      },
    });
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isSubmitting.set(true);

    const payload = {
      name: this.form.controls.name.value,
      destination_url: this.form.controls.destination_url.value,
      image_media_id: this.form.controls.image_media_id.value as number,
      placement: 'footer' as const,
      status: this.form.controls.status.value,
    };

    const sponsorId = this.editingSponsorId();

    const request$ = sponsorId
      ? this.sponsorsService.update(sponsorId, payload)
      : this.sponsorsService.create(payload);

    request$.subscribe({
      next: () => {
        this.successMessage.set(sponsorId ? 'Patrocinador atualizado com sucesso.' : 'Patrocinador criado com sucesso.');
        this.resetForm();
        this.isSubmitting.set(false);
        this.loadSponsors();
      },
      error: () => {
        this.errorMessage.set('Não foi possível salvar patrocinador.');
        this.isSubmitting.set(false);
      },
    });
  }

  edit(sponsor: AdminSponsor): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.editingSponsorId.set(sponsor.id);
    this.form.reset({
      name: sponsor.name,
      destination_url: sponsor.destination_url,
      image_media_id: sponsor.image_media_id,
      status: sponsor.status,
    });
    this.selectedImage.set(sponsor.image ?? null);
  }

  cancelEdit(): void {
    this.resetForm();
  }

  remove(sponsor: AdminSponsor): void {
    this.sponsorsService.remove(sponsor.id).subscribe({
      next: () => {
        this.successMessage.set('Patrocinador removido com sucesso.');
        this.loadSponsors();
      },
      error: () => this.errorMessage.set('Não foi possível remover patrocinador.'),
    });
  }

  private resetForm(): void {
    this.form.reset({ name: '', destination_url: '', image_media_id: null, status: 'active' });
    this.selectedImage.set(null);
    this.editingSponsorId.set(null);
  }
}
