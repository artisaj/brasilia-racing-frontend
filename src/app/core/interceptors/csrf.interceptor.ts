import { HttpInterceptorFn } from '@angular/common/http';

function readCookie(name: string): string | null {
  const cookiePrefix = `${name}=`;
  const cookies = document.cookie.split(';');

  for (const rawCookie of cookies) {
    const cookie = rawCookie.trim();

    if (cookie.startsWith(cookiePrefix)) {
      const value = cookie.substring(cookiePrefix.length);
      return decodeURIComponent(value);
    }
  }

  return null;
}

export const csrfInterceptor: HttpInterceptorFn = (request, next) => {
  const isBackendRequest = request.url.startsWith('http://localhost:8000');
  const isMutatingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method.toUpperCase());

  if (!isBackendRequest || !isMutatingMethod) {
    return next(request);
  }

  const token = readCookie('XSRF-TOKEN');

  if (!token) {
    return next(request);
  }

  const updatedRequest = request.clone({
    setHeaders: {
      'X-XSRF-TOKEN': token,
    },
  });

  return next(updatedRequest);
};
