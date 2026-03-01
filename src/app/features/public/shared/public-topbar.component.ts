import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PublicCategoriesService, PublicCategory } from '../../../core/services/public-categories.service';

@Component({
  selector: 'app-public-topbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, MatToolbarModule],
  templateUrl: './public-topbar.component.html',
  styleUrl: './public-topbar.component.scss',
})
export class PublicTopbarComponent implements OnInit {
  private readonly categoriesService = inject(PublicCategoriesService);

  readonly categories = signal<PublicCategory[]>([]);

  ngOnInit(): void {
    this.categoriesService.listNavbar().subscribe({
      next: (response) => {
        this.categories.set(response.data);
      },
      error: () => {
        this.categories.set([]);
      },
    });
  }
}
