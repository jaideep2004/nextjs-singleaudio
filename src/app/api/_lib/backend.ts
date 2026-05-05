import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const DEFAULT_BACKEND_URL = 'http://localhost:5000';

type ProxyOptions = {
  requireAuth?: boolean;
};

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

const getBackendBaseUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL)
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '');

const getAuthToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value ?? null;
};

const parseJson = async (response: Response): Promise<JsonValue | null> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export async function fetchBackend(
  path: string,
  init: RequestInit = {},
  options: ProxyOptions = {}
) {
  const { requireAuth = true } = options;
  const headers = new Headers(init.headers);

  headers.set('Content-Type', 'application/json');

  if (requireAuth) {
    const token = await getAuthToken();

    if (!token) {
      return {
        ok: false,
        status: 401,
        data: {
          success: false,
          message: 'Authentication required',
          data: null,
        },
      };
    }

    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${getBackendBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  const data = await parseJson(response);

  return {
    ok: response.ok,
    status: response.status,
    data:
      data ??
      ({
        success: false,
        message: `Backend request failed with status ${response.status}`,
        data: null,
      } satisfies JsonValue),
  };
}

export async function proxyBackend(
  path: string,
  init: RequestInit = {},
  options: ProxyOptions = {}
) {
  try {
    const result = await fetchBackend(path, init, options);
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Backend request failed';
    return NextResponse.json(
      {
        success: false,
        message,
        data: null,
      },
      { status: 500 }
    );
  }
}
