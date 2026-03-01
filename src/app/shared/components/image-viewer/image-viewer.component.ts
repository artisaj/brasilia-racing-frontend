import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './image-viewer.component.html',
  styleUrl: './image-viewer.component.scss',
})
export class ImageViewerComponent {
  readonly src = input.required<string>();
  readonly alt = input('Imagem');
  readonly previewMaxHeight = input('clamp(220px, 28vw, 360px)');
  readonly openLabel = input('Abrir imagem');
  readonly showOpenButton = input(true);

  readonly isOpen = signal(false);

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
