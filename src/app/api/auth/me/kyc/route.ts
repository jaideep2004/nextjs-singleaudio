import { proxyBackend } from '@/app/api/_lib/backend';

export async function PUT(request: Request) {
  const data = await request.json();

  return proxyBackend('/api/auth/me/kyc', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
