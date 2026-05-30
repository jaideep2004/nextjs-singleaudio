import { getRequestAuthToken, proxyBackend } from '@/app/api/_lib/backend';

export async function PUT(request: Request) {
  const formData = await request.formData();
  return proxyBackend(
    '/api/auth/me/profile-picture',
    {
      method: 'PUT',
      body: formData,
    },
    { authToken: getRequestAuthToken(request) }
  );
}
