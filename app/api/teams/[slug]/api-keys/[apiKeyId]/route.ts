import { deleteApiKey } from 'models/apiKey';
import { getTeamMember } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { NextRequest, NextResponse } from 'next/server';
import { recordMetric } from '@/lib/metrics';
import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import { deleteApiKeySchema, validateWithSchema } from '@/lib/zod';
import { throwIfNoAccessToApiKey } from '@/lib/guards/team-api-key';
import { getServerSession } from 'next-auth/next';
import { getAuthOptions } from '@/lib/nextAuth';

// Helper function to get team member for app router
async function getTeamMemberForApiKey(slug: string) {
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

// Delete an API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; apiKeyId: string }> }
) {
  try {
    if (!env.teamFeatures.apiKey) {
      throw new ApiError(404, 'Not Found');
    }

    const { slug, apiKeyId } = await params;

    const user = await getTeamMemberForApiKey(slug);

    throwIfNotAllowed(user, 'team_api_key', 'delete');

    const { apiKeyId: validatedApiKeyId } = validateWithSchema(
      deleteApiKeySchema,
      {
        apiKeyId: apiKeyId,
      }
    );

    await throwIfNoAccessToApiKey(validatedApiKeyId, user.team.id);

    await deleteApiKey(validatedApiKeyId);

    recordMetric('apikey.removed');

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
