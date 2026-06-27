import { proxyBackend } from '@/app/api/_lib/backend';

export async function GET(req: Request) {
  const url = new URL(req.url);
  return proxyBackend(`/api/dsp/deliveries${url.search}`);
}
