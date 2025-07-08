import env from '@/lib/env';
import { getTeamMember } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/lib/errors';
import { dsyncManager } from '@/lib/jackson/dsync';
import { sendAudit } from '@/lib/retraced';
import { throwIfNoAccessToDirectory } from '@/lib/guards/team-dsync';
import { getServerSession } from 'next-auth/next';
import { getAuthOptions } from '@/lib/nextAuth';

const dsync = dsyncManager();

// Helper function to get team member for app router
async function getTeamMemberForDsyncDirectory(slug: string) {
  const authOptions = getAuthOptions({} as any, {} as any);
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const teamMember = await getTeamMember(session.user.id, slug);

  if (!teamMember) {
    throw new Error('You do not have access to this team');
  }

  return {
    ...teamMember,
    user: session.user,
  };
}

// Get dsync connection by directory ID
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string; directoryId: string }> }
) {
  const params = await props.params;
  try {
    if (!env.teamFeatures.dsync) {
      throw new ApiError(404, 'Not Found');
    }

    const teamMember = await getTeamMemberForDsyncDirectory(params.slug);

    throwIfNotAllowed(teamMember, 'team_dsync', 'read');

    await throwIfNoAccessToDirectory({
      teamId: teamMember.team.id,
      directoryId: params.directoryId,
    });

    const connection = await dsync.getConnectionById(params.directoryId);

    return NextResponse.json(connection);
  } catch (error: any) {
    console.error(error);

    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}

// Update dsync connection
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ slug: string; directoryId: string }> }
) {
  const params = await props.params;
  try {
    if (!env.teamFeatures.dsync) {
      throw new ApiError(404, 'Not Found');
    }

    const teamMember = await getTeamMemberForDsyncDirectory(params.slug);

    throwIfNotAllowed(teamMember, 'team_dsync', 'read');

    await throwIfNoAccessToDirectory({
      teamId: teamMember.team.id,
      directoryId: params.directoryId,
    });

    const body = await request.json();
    const updateData = { ...params, ...body };

    const connection = await dsync.updateConnection(updateData);

    return NextResponse.json(connection);
  } catch (error: any) {
    console.error(error);

    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}

// Delete dsync connection
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ slug: string; directoryId: string }> }
) {
  const params = await props.params;
  try {
    if (!env.teamFeatures.dsync) {
      throw new ApiError(404, 'Not Found');
    }

    const teamMember = await getTeamMemberForDsyncDirectory(params.slug);

    throwIfNotAllowed(teamMember, 'team_dsync', 'delete');

    await throwIfNoAccessToDirectory({
      teamId: teamMember.team.id,
      directoryId: params.directoryId,
    });

    const data = await dsync.deleteConnection(params);

    sendAudit({
      action: 'dsync.connection.delete',
      crud: 'd',
      user: teamMember.user,
      team: teamMember.team,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(error);

    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
