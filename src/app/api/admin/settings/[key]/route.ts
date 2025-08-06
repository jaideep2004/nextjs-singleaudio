import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET handler for fetching a specific setting by key
export async function GET(
  request: Request,
  { params }: { params: { key: string } }
) {
  const key = params.key;
  
  try {
    // Get authentication token from cookies
    const cookieStore = cookies();
    const token = await cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        data: null
      }, { status: 401 });
    }
    
    // Connect to the backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    console.log(`Fetching setting ${key} from backend: ${backendUrl}/api/settings/${key}`);
    
    const response = await fetch(`${backendUrl}/api/settings/${key}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    const data = await response.json();
    console.log(`Backend setting response for ${key}:`, data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching setting ${key} from backend:`, error);
    return NextResponse.json({
      success: false,
      message: `Failed to fetch setting: ${key}`,
      data: null
    }, { status: 500 });
  }
}

// PUT handler for updating a specific setting by key
export async function PUT(
  request: Request,
  { params }: { params: { key: string } }
) {
  const key = params.key;
  
  try {
    // Get authentication token from cookies
    const cookieStore = cookies();
    const token = await cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        data: null
      }, { status: 401 });
    }
    
    // Get the request body
    const body = await request.json();
    console.log(`Updating setting ${key} with value:`, body);
    
    // Connect to the backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    console.log(`Sending setting update to backend: ${backendUrl}/api/settings/${key}`);
    
    const response = await fetch(`${backendUrl}/api/settings/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    console.log(`Backend setting update response for ${key}:`, data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error updating setting ${key} on backend:`, error);
    return NextResponse.json({
      success: false,
      message: `Failed to update setting: ${key}`,
      data: null
    }, { status: 500 });
  }
} 