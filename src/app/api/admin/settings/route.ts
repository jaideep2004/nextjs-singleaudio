import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
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
    console.log(`Fetching all settings from backend: ${backendUrl}/api/settings`);
    
    const response = await fetch(`${backendUrl}/api/settings`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    const data = await response.json();
    console.log('Backend settings response:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching settings from backend:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch settings',
      data: null
    }, { status: 500 });
  }
} 