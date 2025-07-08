import { NextRequest, NextResponse } from 'next/server';
import { slugify } from '@/lib/server-common';
import { ApiError } from '@/lib/errors';
import { createTeam, getTeams, isTeamExists } from 'models/team';
import { recordMetric } from '@/lib/metrics';
import { createTeamSchema, validateWithSchema } from '@/lib/zod';
import { getServerSession } from 'next-auth/next';
import { getAuthOptions } from '@/lib/nextAuth';

// Get teams
export async function GET(request: NextRequest) {
  try {
    const authOptions = getAuthOptions({} as any, {} as any);
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      throw new Error('Unauthorized');
    }

    const teams = await getTeams(session.user.id);

    recordMetric('team.fetched');

    return NextResponse.json({ data: teams });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}

// Create a team
export async function POST(request: NextRequest) {
  try {
    const { name } = validateWithSchema(createTeamSchema, await request.json());

    const authOptions = getAuthOptions({} as any, {} as any);
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      throw new Error('Unauthorized');
    }

    const slug = slugify(name);

    if (await isTeamExists(slug)) {
      throw new ApiError(400, 'A team with the slug already exists.');
    }

    const team = await createTeam({
      userId: session.user.id,
      name,
      slug,
    });

    recordMetric('team.created');

    return NextResponse.json({ data: team });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
