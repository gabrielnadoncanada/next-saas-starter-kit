import env from '@/lib/env';
import { sendAudit } from '@/lib/retraced';
import { getTeamMember } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/lib/errors';
import { dsyncManager } from '@/lib/jackson/dsync';
import { getServerSession } from 'next-auth/next';
import { getAuthOptions } from '@/lib/nextAuth';

const dsync = dsyncManager();

// Helper function to get team member for app router
async function getTeamMemberForDsync(slug: string) {
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

// Get dsync connections
export async function GET(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    if (!env.teamFeatures.dsync) {
      throw new ApiError(404, 'Not Found');
    }

    const teamMember = await getTeamMemberForDsync(params.slug);

    throwIfNotAllowed(teamMember, 'team_dsync', 'read');

    const connections = await dsync.getConnections({
      tenant: teamMember.teamId,
    });

    return NextResponse.json(connections);
  } catch (error: any) {
    console.error(error);

    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}

// Create a dsync connection
export async function POST(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    if (!env.teamFeatures.dsync) {
      throw new ApiError(404, 'Not Found');
    }

    const teamMember = await getTeamMemberForDsync(params.slug);

    throwIfNotAllowed(teamMember, 'team_dsync', 'create');

    const body = await request.json();

    const connection = await dsync.createConnection({
      ...body,
      tenant: teamMember.teamId,
    });

    sendAudit({
      action: 'dsync.connection.create',
      crud: 'c',
      user: teamMember.user,
      team: teamMember.team,
    });

    return NextResponse.json(connection, { status: 201 });
  } catch (error: any) {
    console.error(error);

    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
