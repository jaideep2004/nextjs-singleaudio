import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentBackendUser, type CurrentBackendUser } from '@/lib/currentUser';
import { rssApi, RssApiError } from '@/lib/rssApi';
import {
  deleteUserPodcastOwnershipForPodcast,
  listPodcastOwnerships,
  upsertUserPodcastOwnership,
} from '@/lib/rssOwnership';
import { connectToDatabase } from '@/utils/mongodb';

type AssignmentUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  artistName?: string;
  permissions?: string[];
  isActive?: boolean;
};

const canManagePodcastAssignments = (user: CurrentBackendUser) =>
  user.role === 'admin';

const getPodcastLimitForRole = (role: string) => {
  if (role === 'admin') return Number.POSITIVE_INFINITY;
  if (role === 'subadmin') return 2;
  return 1;
};

const toAssignmentUser = (user: Record<string, unknown>): AssignmentUser => ({
  _id: String(user._id),
  name: typeof user.name === 'string' ? user.name : '',
  email: typeof user.email === 'string' ? user.email : '',
  role: typeof user.role === 'string' ? user.role : '',
  artistName: typeof user.artistName === 'string' ? user.artistName : undefined,
  permissions: Array.isArray(user.permissions)
    ? user.permissions.filter((permission): permission is string => typeof permission === 'string')
    : [],
  isActive: typeof user.isActive === 'boolean' ? user.isActive : undefined,
});

async function getAssignableUsers(): Promise<AssignmentUser[]> {
  const { db } = await connectToDatabase();
  const users = await db
    .collection('users')
    .find(
      {},
      {
        projection: {
          password: 0,
          resetPasswordToken: 0,
          resetPasswordExpire: 0,
          socialLinks: 0,
          bio: 0,
        },
      }
    )
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  return users.map((user) => toAssignmentUser(user));
}

async function getAssignableUser(userId: string): Promise<AssignmentUser | null> {
  if (!ObjectId.isValid(userId)) return null;

  const { db } = await connectToDatabase();
  const user = await db.collection('users').findOne(
    { _id: new ObjectId(userId) },
    {
      projection: {
        password: 0,
        resetPasswordToken: 0,
        resetPasswordExpire: 0,
      },
    }
  );

  return user ? toAssignmentUser(user) : null;
}

async function requirePodcastAssignmentAccess() {
  const user = await getCurrentBackendUser();

  if (!canManagePodcastAssignments(user)) {
    return {
      user,
      response: NextResponse.json(
        { success: false, message: 'Podcast assignment requires admin access.' },
        { status: 403 }
      ),
    };
  }

  return { user, response: null };
}

export async function GET() {
  try {
    const { response } = await requirePodcastAssignmentAccess();
    if (response) return response;

    const [podcasts, assignments, users] = await Promise.all([
      rssApi.getPodcasts(),
      listPodcastOwnerships(),
      getAssignableUsers(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        podcasts,
        assignments,
        users,
      },
    });
  } catch (error) {
    if (error instanceof RssApiError) {
      return NextResponse.json(
        { success: false, message: error.message, details: error.details ?? null },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to load podcast assignments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { response } = await requirePodcastAssignmentAccess();
    if (response) return response;

    const body = (await request.json()) as { userId?: string; rssPodcastId?: number | string };
    const userId = body.userId?.trim();
    const rssPodcastId = Number(body.rssPodcastId);

    if (!userId || !Number.isInteger(rssPodcastId) || rssPodcastId <= 0) {
      return NextResponse.json(
        { success: false, message: 'Select a valid user and RSS podcast.' },
        { status: 400 }
      );
    }

    const targetUser = await getAssignableUser(userId);
    if (!targetUser) {
      return NextResponse.json({ success: false, message: 'Selected user was not found.' }, { status: 404 });
    }

    const existingAssignments = await listPodcastOwnerships();
    const alreadyAssigned = existingAssignments.some(
      (assignment) => assignment.userId === userId && assignment.rssPodcastId === rssPodcastId
    );
    const assignedToAnotherUser = existingAssignments.some(
      (assignment) => assignment.userId !== userId && assignment.rssPodcastId === rssPodcastId
    );
    const currentUserAssignmentCount = existingAssignments.filter((assignment) => assignment.userId === userId).length;
    const assignmentLimit = getPodcastLimitForRole(targetUser.role);

    if (assignedToAnotherUser) {
      return NextResponse.json(
        { success: false, message: 'This RSS podcast is already assigned. Remove that assignment first.' },
        { status: 409 }
      );
    }

    if (!alreadyAssigned && currentUserAssignmentCount >= assignmentLimit) {
      return NextResponse.json(
        {
          success: false,
          message:
            targetUser.role === 'subadmin'
              ? 'Subadmins can manage up to 2 RSS podcasts.'
              : 'This user can manage only 1 RSS podcast.',
        },
        { status: 409 }
      );
    }

    await rssApi.getPodcast(rssPodcastId);
    await upsertUserPodcastOwnership(userId, rssPodcastId);

    return NextResponse.json({
      success: true,
      message: alreadyAssigned ? 'Podcast already assigned.' : 'Podcast assigned.',
      data: {
        userId,
        rssPodcastId,
      },
    });
  } catch (error) {
    if (error instanceof RssApiError) {
      return NextResponse.json(
        { success: false, message: error.message, details: error.details ?? null },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to assign RSS podcast' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { response } = await requirePodcastAssignmentAccess();
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId')?.trim();
    const rssPodcastId = Number(searchParams.get('rssPodcastId'));

    if (!userId || !Number.isInteger(rssPodcastId) || rssPodcastId <= 0) {
      return NextResponse.json(
        { success: false, message: 'Select a valid assignment to remove.' },
        { status: 400 }
      );
    }

    await deleteUserPodcastOwnershipForPodcast(userId, rssPodcastId);

    return NextResponse.json({
      success: true,
      message: 'Podcast assignment removed.',
      data: { userId, rssPodcastId },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to remove podcast assignment' },
      { status: 500 }
    );
  }
}
