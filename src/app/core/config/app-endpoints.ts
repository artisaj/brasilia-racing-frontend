const hostname = globalThis.location?.hostname ?? 'localhost';

const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';

const ADMIN_HOSTS = ['administracao.brasiliaracing.com.br', 'brasiliaracing.com.br', 'www.brasiliaracing.com.br'];
const PUBLIC_HOSTS = ['brasiliaracing.com.br', 'www.brasiliaracing.com.br'];

export const API_BASE_URL = isLocalHost
  ? 'http://localhost:8000'
  : globalThis.location?.origin ?? 'https://brasiliaracing.com.br';

export const ADMIN_APP_URL = isLocalHost
  ? 'http://localhost:4200/admin/login'
  : 'https://administracao.brasiliaracing.com.br';

export const PUBLIC_APP_URL = isLocalHost ? 'http://localhost:4200' : 'https://brasiliaracing.com.br';

export function isAdminSurfaceHost(): boolean {
  if (isLocalHost) {
    return true;
  }

  return ADMIN_HOSTS.includes(hostname);
}

export function isPublicSurfaceHost(): boolean {
  if (isLocalHost) {
    return true;
  }

  return PUBLIC_HOSTS.includes(hostname);
}
