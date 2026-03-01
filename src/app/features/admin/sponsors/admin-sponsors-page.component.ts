import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { AdminSponsorsService, AdminSponsor } from '../../../core/services/admin-sponsors.service';
import { AdminMediaService, AdminMedia } from '../../../core/services/admin-media.service';

@Component({
  selector: 'app-admin-sponsors-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatToolbarModule,
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
  readonly sponsors = signal<AdminSponsor[]>([]);
  readonly selectedImage = signal<AdminMedia | null>(null);
  readonly displayedColumns = ['id', 'name', 'status', 'image', 'actions'];

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    destination_url: ['', [Validators.required]],
    image_media_id: [null as number | null, [Validators.required]],
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
    this.isSubmitting.set(true);

    this.sponsorsService
      .create({
        name: this.form.controls.name.value,
        destination_url: this.form.controls.destination_url.value,
        image_media_id: this.form.controls.image_media_id.value as number,
        placement: 'footer',
        status: 'active',
      })
      .subscribe({
        next: () => {
          this.form.reset({ name: '', destination_url: '', image_media_id: null });
          this.selectedImage.set(null);
          this.isSubmitting.set(false);
          this.loadSponsors();
        },
        error: () => {
          this.errorMessage.set('Não foi possível salvar patrocinador.');
          this.isSubmitting.set(false);
        },
      });
  }

  remove(sponsor: AdminSponsor): void {
    this.sponsorsService.remove(sponsor.id).subscribe({
      next: () => this.loadSponsors(),
      error: () => this.errorMessage.set('Não foi possível remover patrocinador.'),
    });
  }
}
