import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const DEFAULT_BACKEND_URL = 'http://localhost:5000';

const getBackendBaseUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL)
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '');

const parseBackendJson = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return { success: false, message: `Backend request failed with status ${response.status}` };
  }
};

export async function PUT(request: Request) {
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');
    const body = isMultipart ? await request.formData() : JSON.stringify(await request.json());
    const headers = new Headers({ Authorization: `Bearer ${token}` });

    if (!isMultipart) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${getBackendBaseUrl()}/api/auth/me/kyc`, {
      method: 'PUT',
      headers,
      body,
    });
    const data = await parseBackendJson(response);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'KYC submission failed' },
      { status: 500 }
    );
  }
}
