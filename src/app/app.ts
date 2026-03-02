import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs';
import { LoadingStateService } from './core/services/loading-state.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatProgressSpinnerModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  readonly loadingState = inject(LoadingStateService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);

  constructor() {
    this.updateTitle(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateTitle(event.urlAfterRedirects);
      });
  }

  private updateTitle(url: string): void {
    const isAdmin = url.startsWith('/admin');
    this.title.setTitle(isAdmin ? 'Brasília Racing - Admin' : 'Brasília Racing');
  }
}
