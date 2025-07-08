import { ApiError } from '@/lib/errors';
import { sendAudit } from '@/lib/retraced';
import {
  createWebhook,
  deleteWebhook,
  findOrCreateApp,
  createEventType,
  listWebhooks,
} from '@/lib/svix';
import { getTeamMember } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { NextRequest, NextResponse } from 'next/server';
import { EndpointIn } from 'svix';
import { recordMetric } from '@/lib/metrics';
import env from '@/lib/env';
import {
  deleteWebhookSchema,
  validateWithSchema,
  webhookEndpointSchema,
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

// Get all webhooks created by a team
export async function GET(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    if (!env.teamFeatures.webhook) {
      throw new ApiError(404, 'Not Found');
    }

    const teamMember = await getTeamMemberForWebhooks(params.slug);
    throwIfNotAllowed(teamMember, 'team_webhook', 'read');

    const app = await findOrCreateApp(teamMember.team.name, teamMember.team.id);

    if (!app) {
      throw new ApiError(400, 'Bad request. Please add a Svix API key.');
    }

    const webhooks = await listWebhooks(app.id);

    recordMetric('webhook.fetched');

    return NextResponse.json({ data: webhooks?.data || [] });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}

// Create a Webhook endpoint
export async function POST(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    if (!env.teamFeatures.webhook) {
      throw new ApiError(404, 'Not Found');
    }

    const teamMember = await getTeamMemberForWebhooks(params.slug);
    throwIfNotAllowed(teamMember, 'team_webhook', 'create');

    const body = await request.json();
    const { name, url, eventTypes } = validateWithSchema(
      webhookEndpointSchema,
      body
    );
    const app = await findOrCreateApp(teamMember.team.name, teamMember.team.id);

    // TODO: The endpoint URL must be HTTPS.

    const data: EndpointIn = {
      description: name,
      url,
      version: 1,
    };

    if (eventTypes.length) {
      data['filterTypes'] = eventTypes;
    }

    for (const eventType of eventTypes) {
      await createEventType(eventType);
    }

    if (!app) {
      throw new ApiError(400, 'Bad request.');
    }

    const endpoint = await createWebhook(app.id, data);

    sendAudit({
      action: 'webhook.create',
      crud: 'c',
      user: teamMember.user,
      team: teamMember.team,
    });

    recordMetric('webhook.created');

    return NextResponse.json({ data: endpoint });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}

// Delete a webhook
export async function DELETE(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    if (!env.teamFeatures.webhook) {
      throw new ApiError(404, 'Not Found');
    }

    const teamMember = await getTeamMemberForWebhooks(params.slug);
    throwIfNotAllowed(teamMember, 'team_webhook', 'delete');

    const url = new URL(request.url);
    const webhookId = url.searchParams.get('webhookId');

    const { webhookId: validatedWebhookId } = validateWithSchema(
      deleteWebhookSchema,
      { webhookId: webhookId || '' }
    );

    const app = await findOrCreateApp(teamMember.team.name, teamMember.team.id);

    if (!app) {
      throw new ApiError(400, 'Bad request.');
    }

    if (app.uid != teamMember.team.id) {
      throw new ApiError(400, 'Bad request.');
    }

    await deleteWebhook(app.id, validatedWebhookId);

    sendAudit({
      action: 'webhook.delete',
      crud: 'd',
      user: teamMember.user,
      team: teamMember.team,
    });

    recordMetric('webhook.removed');

    return NextResponse.json({ data: {} });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
