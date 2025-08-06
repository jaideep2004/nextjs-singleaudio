import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = searchParams.get('limit') || '5';
  const sort = searchParams.get('sort') || '-createdAt';

  // Mock data for pending tracks
  const pendingTracks = [
    {
      id: '1',
      title: 'Track 1',
      artist: 'Artist 1',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Track 2',
      artist: 'Artist 2',
      status: 'pending',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Filter by status if provided
  let filteredTracks = pendingTracks;
  if (status) {
    filteredTracks = pendingTracks.filter(track => track.status === status);
  }

  // Sort the tracks
  const [sortField, sortOrder] = sort.startsWith('-') 
    ? [sort.slice(1), 'desc'] 
    : [sort, 'asc'];

  const sortedTracks = [...filteredTracks].sort((a: any, b: any) => {
    if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Apply limit
  const limitedTracks = sortedTracks.slice(0, parseInt(limit));

  return NextResponse.json({
    success: true,
    data: limitedTracks,
    pagination: {
      total: pendingTracks.length,
      page: 1,
      limit: parseInt(limit),
      totalPages: 1,
    },
  });
}

export const dynamic = 'force-dynamic';
