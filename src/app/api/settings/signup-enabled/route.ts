import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Connect to the backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    console.log(`Checking if signups are enabled: ${backendUrl}/api/settings/signupEnabled`);
    
    const response = await fetch(`${backendUrl}/api/settings/signupEnabled`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // No auth token needed for this public endpoint
    });
    
    const data = await response.json();
    console.log('Signup enabled check response:', data);
    
    // If the request was successful and we got data
    if (data.success && data.data) {
      return NextResponse.json({
        success: true,
        enabled: data.data.value === true
      });
    } else {
      // Default to enabled if there's an error or no data
      return NextResponse.json({
        success: true,
        enabled: true
      });
    }
  } catch (error) {
    console.error('Error checking if signups are enabled:', error);
    // Default to enabled if there's an error
    return NextResponse.json({
      success: false,
      enabled: true,
      message: 'Failed to check if signups are enabled'
    });
  }
} 