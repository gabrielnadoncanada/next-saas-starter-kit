import { ApiError } from '@/lib/errors';
import { findOrCreateApp, createWebhook, listWebhooks } from '@/lib/svix';
import { getTeamMember } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { NextRequest, NextResponse } from 'next/server';
import { recordMetric } from '@/lib/metrics';
import env from '@/lib/env';
import {
  createWebhookEndpointSchema,
  getWebhooksSchema,
  validateWithSchema,
} from '@/lib/zod';
import { getServerSession } from 'next-auth/next';
import { getAuthOptions } from '@/lib/nextAuth';

// Helper function to get team member for app router
async function getTeamMemberForWebhooks(slug: string) {
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

// Get all webhooks for a team
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!env.teamFeatures.webhook) {
      throw new ApiError(404, 'Not Found');
    }

    const { slug } = await params;
    const teamMember = await getTeamMemberForWebhooks(slug);
    throwIfNotAllowed(teamMember, 'team_webhook', 'read');

    const url = new URL(request.url);
    const limit = url.searchParams.get('limit');

    const { limit: validatedLimit } = validateWithSchema(getWebhooksSchema, {
      limit: limit || '50',
    });

    const app = await findOrCreateApp(teamMember.team.name, teamMember.team.id);

    const { data: webhooks, iterator } = await listWebhooks(
      app.id,
      validatedLimit
    );

    recordMetric('webhook.fetched');

    return NextResponse.json({
      data: webhooks,
      pagination: {
        iterator,
      },
    });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}

// Create a webhook
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!env.teamFeatures.webhook) {
      throw new ApiError(404, 'Not Found');
    }

    const { slug } = await params;
    const teamMember = await getTeamMemberForWebhooks(slug);
    throwIfNotAllowed(teamMember, 'team_webhook', 'create');

    const { name, url, eventTypes } = validateWithSchema(
      createWebhookEndpointSchema,
      await request.json()
    );

    const app = await findOrCreateApp(teamMember.team.name, teamMember.team.id);

    const webhook = await createWebhook(app.id, {
      name,
      url,
      eventTypes,
    });

    recordMetric('webhook.created');

    return NextResponse.json({ data: webhook }, { status: 201 });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
