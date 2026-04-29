import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Resolve the params promise
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    // Get authentication token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        data: null
      }, { status: 401 });
    }
    
    // Connect to the backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    console.log('Fetching user from backend:', `${backendUrl}/api/users/${userId}`);
    
    const response = await fetch(`${backendUrl}/api/users/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    const data = await response.json();
    console.log('Backend user response:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching user from backend:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch user from backend',
      data: null
    }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Resolve the params promise
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    // Get authentication token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        data: null
      }, { status: 401 });
    }
    
    // Get request body
    const userData = await request.json();
    console.log('Updating user with data:', userData);
    
    // Connect to the backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    console.log('Updating user at backend:', `${backendUrl}/api/users/${userId}`);
    
    const response = await fetch(`${backendUrl}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    console.log('Backend user update response:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating user on backend:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update user',
      data: null
    }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Resolve the params promise
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    // Get authentication token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        data: null
      }, { status: 401 });
    }
    
    // Connect to the backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    console.log('Deleting user at backend:', `${backendUrl}/api/users/${userId}`);
    
    const response = await fetch(`${backendUrl}/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    console.log('Backend user deletion response:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting user on backend:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete user',
      data: null
    }, { status: 500 });
  }
}