import { NextResponse } from 'next/server';
import { fetchBackend } from '@/app/api/_lib/backend';

export async function GET() {
  try {
    const result = await fetchBackend('/api/users/stats');
    const data = result.data as {
      data?: {
        totalUsers?: number;
        totalTracks?: number;
        pendingTracks?: number;
        pendingPayouts?: number;
        totalRevenue?: number;
        totalReleases?: number;
        pendingReleases?: number;
      };
    } | null;

    return NextResponse.json({
      success: result.ok,
      data: {
        totalUsers: data.data?.totalUsers || 0,
        totalTracks: data.data?.totalTracks || 0,
        pendingTracks: data.data?.pendingTracks || 0,
        pendingPayouts: data.data?.pendingPayouts || 0,
        totalRevenue: data.data?.totalRevenue || 0,
        totalReleases: data.data?.totalReleases || 0,
        pendingReleases: data.data?.pendingReleases || 0
      }
    }, { status: result.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch stats from backend';
    return NextResponse.json({
      success: false,
      message,
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
