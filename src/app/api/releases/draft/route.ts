import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { getCurrentBackendUser } from '@/lib/currentUser';
import {
  deleteReleaseDraftForUser,
  getReleaseDraftForUser,
  upsertReleaseDraftForUser,
} from '@/lib/repositories/releaseDrafts';

export async function GET() {
  try {
    const user = await getCurrentBackendUser();
    const { db } = await connectToDatabase();
    const draft = await getReleaseDraftForUser(db, String(user._id));

    return NextResponse.json({
      success: true,
      draft: draft?.draft || null,
      updatedAt: draft?.updatedAt || null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load release draft';
    return NextResponse.json(
      { success: false, error: message },
      { status: message === 'Authentication required' ? 401 : 500 }
    );
  }
}

async function saveReleaseDraft(req: NextRequest) {
  try {
    const user = await getCurrentBackendUser();
    const body = await req.json().catch(() => null);
    const draft = body?.draft;

    if (!draft || typeof draft !== 'object' || draft.status !== 'draft') {
      return NextResponse.json({ success: false, error: 'Invalid draft payload' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const saved = await upsertReleaseDraftForUser(db, String(user._id), {
      ...draft,
      ownerUserId: String(user._id),
    });

    return NextResponse.json({
      success: true,
      draft: saved.value?.draft || draft,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save release draft';
    return NextResponse.json(
      { success: false, error: message },
      { status: message === 'Authentication required' ? 401 : 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return saveReleaseDraft(req);
}

export async function POST(req: NextRequest) {
  return saveReleaseDraft(req);
}

export async function DELETE() {
  try {
    const user = await getCurrentBackendUser();
    const { db } = await connectToDatabase();
    await deleteReleaseDraftForUser(db, String(user._id));

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete release draft';
    return NextResponse.json(
      { success: false, error: message },
      { status: message === 'Authentication required' ? 401 : 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
