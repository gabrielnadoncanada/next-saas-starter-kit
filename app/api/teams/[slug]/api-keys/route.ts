import { createApiKey, fetchApiKeys } from 'models/apiKey';
import { getTeamMember } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { NextRequest, NextResponse } from 'next/server';
import { recordMetric } from '@/lib/metrics';
import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import { createApiKeySchema, validateWithSchema } from '@/lib/zod';
import { getServerSession } from 'next-auth/next';
import { getAuthOptions } from '@/lib/nextAuth';

// Helper function to get team member for app router
async function getTeamMemberForApiKeys(slug: string) {
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

// Get API keys
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!env.teamFeatures.apiKey) {
      throw new ApiError(404, 'Not Found');
    }

    const { slug } = await params;
    const user = await getTeamMemberForApiKeys(slug);

    throwIfNotAllowed(user, 'team_api_key', 'read');

    const apiKeys = await fetchApiKeys(user.team.id);

    recordMetric('apikey.fetched');

    return NextResponse.json({ data: apiKeys });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}

// Create an API key
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!env.teamFeatures.apiKey) {
      throw new ApiError(404, 'Not Found');
    }

    const { slug } = await params;
    const user = await getTeamMemberForApiKeys(slug);

    throwIfNotAllowed(user, 'team_api_key', 'create');

    const body = await request.json();
    const { name } = validateWithSchema(createApiKeySchema, body);

    const apiKey = await createApiKey({
      name,
      teamId: user.team.id,
    });

    recordMetric('apikey.created');

    return NextResponse.json({ data: { apiKey } }, { status: 201 });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
