import { sendAudit } from '@/lib/retraced';
import { deleteTeam, getTeam, updateTeam, getTeamMember } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { NextRequest, NextResponse } from 'next/server';
import { recordMetric } from '@/lib/metrics';
import { ApiError } from '@/lib/errors';
import env from '@/lib/env';
import {
  updateTeamSchema,
  validateWithSchema,
  teamSlugSchema,
} from '@/lib/zod';
import { Prisma, type Team } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { getAuthOptions } from '@/lib/nextAuth';

// Helper function to get current user with team for app router
async function getCurrentUserWithTeam(slug: string) {
  const authOptions = getAuthOptions({} as any, {} as any);
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const { role, team } = await getTeamMember(session.user.id, slug);

  return {
    ...session.user,
    role,
    team,
  };
}

// Get a team by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const user = await getCurrentUserWithTeam(slug);

    throwIfNotAllowed(user, 'team', 'read');

    const team = await getTeam({ id: user.team.id });

    recordMetric('team.fetched');

    return NextResponse.json({ data: team });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}

// Update a team
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: teamSlug } = await params;
    const user = await getCurrentUserWithTeam(teamSlug);

    throwIfNotAllowed(user, 'team', 'update');

    const body = await request.json();
    const { name, slug, domain } = validateWithSchema(updateTeamSchema, body);

    let updatedTeam: Team | null = null;

    try {
      updatedTeam = await updateTeam(user.team.slug, {
        name,
        slug,
        domain,
      });
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        error.meta?.target
      ) {
        const target = error.meta.target as string[];

        if (target.includes('slug')) {
          throw new ApiError(409, 'This slug is already taken for a team.');
        }

        if (target.includes('domain')) {
          throw new ApiError(
            409,
            'This domain is already associated with a team.'
          );
        }
      }

      throw error;
    }

    sendAudit({
      action: 'team.update',
      crud: 'u',
      user,
      team: user.team,
    });

    recordMetric('team.updated');

    return NextResponse.json({ data: updatedTeam });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}

// Delete a team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!env.teamFeatures.deleteTeam) {
      throw new ApiError(404, 'Not Found');
    }

    const { slug } = await params;
    const user = await getCurrentUserWithTeam(slug);

    throwIfNotAllowed(user, 'team', 'delete');

    await deleteTeam({ id: user.team.id });

    sendAudit({
      action: 'team.delete',
      crud: 'd',
      user,
      team: user.team,
    });

    recordMetric('team.removed');

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
