import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '10';
  const page = searchParams.get('page') || '1';
  const sort = searchParams.get('sort') || '-createdAt';
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status');

  try {
    // Get authentication token from cookies
    const cookieStore = cookies();
    const token = await cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        data: {
          users: [],
          pagination: {
            total: 0,
            limit: parseInt(limit),
            page: parseInt(page),
            pages: 1
          }
        }
      }, { status: 401 });
    }
    
    // Build query string for backend API
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit);
    if (page) queryParams.append('page', page);
    if (sort) queryParams.append('sort', sort);
    if (search) queryParams.append('search', search);
    if (status) queryParams.append('status', status);
    
    // Connect to the backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    console.log('Fetching users from backend:', `${backendUrl}/api/users?${queryParams.toString()}`);
    
    const response = await fetch(`${backendUrl}/api/users?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    const data = await response.json();
    console.log('Backend response:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching users from backend:', error);
    // Return empty array as fallback
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch users from backend',
      data: {
        users: [],
        pagination: {
          total: 0,
          limit: parseInt(limit),
          page: parseInt(page),
          pages: 1
        }
      }
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
    
    // Get request body
    const userData = await request.json();
    console.log('Creating user with data:', userData);
    
    // Connect to the backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    console.log('Creating user at backend:', `${backendUrl}/api/users`);
    
    const response = await fetch(`${backendUrl}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    console.log('Backend user creation response:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating user on backend:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create user',
      data: null
    }, { status: 500 });
  }
}
