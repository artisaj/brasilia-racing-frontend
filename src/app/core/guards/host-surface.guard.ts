import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { isAdminSurfaceHost, isPublicSurfaceHost } from '../config/app-endpoints';

export const adminSurfaceGuard: CanMatchFn = () => {
  if (isAdminSurfaceHost()) {
    return true;
  }

  return inject(Router).createUrlTree(['/']);
};

export const publicSurfaceGuard: CanMatchFn = () => {
  if (isPublicSurfaceHost()) {
    return true;
  }

  return inject(Router).createUrlTree(['/admin/login']);
};
