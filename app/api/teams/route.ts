import { NextRequest, NextResponse } from 'next/server';
import { slugify } from '@/lib/server-common';
import { ApiError } from '@/lib/errors';
import { createTeam, getTeams, isTeamExists } from 'models/team';
import { recordMetric } from '@/lib/metrics';
import { createTeamSchema, validateWithSchema } from '@/lib/zod';
import { getCurrentUser } from 'models/user';

// Get teams
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request as any, {} as any);
    const teams = await getTeams(user.id);

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

    const user = await getCurrentUser(request as any, {} as any);
    const slug = slugify(name);

    if (await isTeamExists(slug)) {
      throw new ApiError(400, 'A team with the slug already exists.');
    }

    const team = await createTeam({
      userId: user.id,
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
