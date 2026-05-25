import { getRequestAuthToken, proxyBackend } from '@/app/api/_lib/backend';

export async function GET(request: Request) {
  return proxyBackend('/api/auth/me', {}, { authToken: getRequestAuthToken(request) });
}
