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
    console.log('Fetching stats from backend:', `${backendUrl}/api/users/stats`);
    
    const response = await fetch(`${backendUrl}/api/users/stats`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    const data = await response.json();
    console.log('Backend stats response:', data);
    
    // Format the response to match what the frontend expects
  return NextResponse.json({
    success: true,
      data: {
        totalUsers: data.data?.totalUsers || 0,
        totalTracks: data.data?.totalTracks || 0,
        pendingTracks: data.data?.pendingTracks || 0,
        pendingPayouts: data.data?.pendingPayouts || 0,
        totalRevenue: data.data?.totalRevenue || 0,
        totalReleases: data.data?.totalReleases || 0,
        pendingReleases: data.data?.pendingReleases || 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats from backend:', error);
    // Return default stats as fallback
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch stats from backend',
    data: {
      totalUsers: 0,
      totalTracks: 0,
      pendingTracks: 0,
      pendingPayouts: 0,
      totalRevenue: 0,
      totalReleases: 0,
      pendingReleases: 0
    }
    }, { status: 500 });
  }
}
