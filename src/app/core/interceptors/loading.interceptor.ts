import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingStateService } from '../services/loading-state.service';

export const loadingInterceptor: HttpInterceptorFn = (request, next) => {
  const loadingState = inject(LoadingStateService);

  loadingState.start();

  return next(request).pipe(
    finalize(() => {
      loadingState.stop();
    }),
  );
};
