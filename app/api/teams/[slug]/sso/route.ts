import { NextRequest, NextResponse } from 'next/server';
import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import { sendAudit } from '@/lib/retraced';
import { getTeamMember } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { ssoManager } from '@/lib/jackson/sso/index';
import {
  extractClientId,
  throwIfNoAccessToConnection,
} from '@/lib/guards/team-sso';
import { getServerSession } from 'next-auth/next';
import { getAuthOptions } from '@/lib/nextAuth';

const sso = ssoManager();

// Helper function to get team member for app router
async function getTeamMemberForSSO(slug: string) {
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

// Get the SSO connection for the team
export async function GET(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    if (!env.teamFeatures.sso) {
      throw new ApiError(404, 'Not Found');
    }

    const teamMember = await getTeamMemberForSSO(params.slug);

    throwIfNotAllowed(teamMember, 'team_sso', 'read');

    const url = new URL(request.url);
    const clientID = url.searchParams.get('clientID');

    if (clientID) {
      await throwIfNoAccessToConnection({
        teamId: teamMember.teamId,
        clientId: clientID,
      });
    }

    const connectionParams = clientID
      ? { clientID }
      : { tenant: teamMember.teamId, product: env.jackson.productId };

    const connections = await sso.getConnections(connectionParams);

    return NextResponse.json(connections);
  } catch (err: any) {
    console.error(err);

    const message = err.message || 'Something went wrong';
    const status = err.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}

// Create a SSO connection for the team
export async function POST(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    if (!env.teamFeatures.sso) {
      throw new ApiError(404, 'Not Found');
    }

    const teamMember = await getTeamMemberForSSO(params.slug);

    throwIfNotAllowed(teamMember, 'team_sso', 'create');

    const body = await request.json();

    const connection = await sso.createConnection({
      ...body,
      defaultRedirectUrl:
        env.jackson.sso.callback + env.jackson.sso.idpLoginPath,
      redirectUrl: env.jackson.sso.callback,
      product: env.jackson.productId,
      tenant: teamMember.teamId,
    });

    sendAudit({
      action: 'sso.connection.create',
      crud: 'c',
      user: teamMember.user,
      team: teamMember.team,
    });

    return NextResponse.json(connection, { status: 201 });
  } catch (err: any) {
    console.error(err);

    const message = err.message || 'Something went wrong';
    const status = err.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}

// Update a SSO connection for the team
export async function PATCH(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    if (!env.teamFeatures.sso) {
      throw new ApiError(404, 'Not Found');
    }

    const teamMember = await getTeamMemberForSSO(params.slug);

    throwIfNotAllowed(teamMember, 'team_sso', 'create');

    const url = new URL(request.url);
    const clientID = url.searchParams.get('clientID');

    if (clientID) {
      await throwIfNoAccessToConnection({
        teamId: teamMember.teamId,
        clientId: clientID,
      });
    }

    const body = await request.json();

    await sso.updateConnection({
      ...body,
      tenant: teamMember.teamId,
      product: env.jackson.productId,
    });

    sendAudit({
      action: 'sso.connection.patch',
      crud: 'u',
      user: teamMember.user,
      team: teamMember.team,
    });

    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    console.error(err);

    const message = err.message || 'Something went wrong';
    const status = err.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}

// Delete a SSO connection for the team
export async function DELETE(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    if (!env.teamFeatures.sso) {
      throw new ApiError(404, 'Not Found');
    }

    const teamMember = await getTeamMemberForSSO(params.slug);

    throwIfNotAllowed(teamMember, 'team_sso', 'delete');

    const url = new URL(request.url);
    const clientID = url.searchParams.get('clientID');

    if (clientID) {
      await throwIfNoAccessToConnection({
        teamId: teamMember.teamId,
        clientId: clientID,
      });
    }

    const queryParams = Object.fromEntries(url.searchParams);

    await sso.deleteConnection({
      ...queryParams,
      tenant: teamMember.teamId,
      product: env.jackson.productId,
    });

    sendAudit({
      action: 'sso.connection.delete',
      crud: 'c',
      user: teamMember.user,
      team: teamMember.team,
    });

    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    console.error(err);

    const message = err.message || 'Something went wrong';
    const status = err.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
