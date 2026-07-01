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
    const stats = data?.data;

    return NextResponse.json({
      success: result.ok,
      data: {
        totalUsers: stats?.totalUsers || 0,
        totalTracks: stats?.totalTracks || 0,
        pendingTracks: stats?.pendingTracks || 0,
        pendingPayouts: stats?.pendingPayouts || 0,
        totalRevenue: stats?.totalRevenue || 0,
        totalReleases: stats?.totalReleases || 0,
        pendingReleases: stats?.pendingReleases || 0
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
