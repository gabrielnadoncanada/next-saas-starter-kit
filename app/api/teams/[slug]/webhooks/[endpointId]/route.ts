import { ApiError } from '@/lib/errors';
import { sendAudit } from '@/lib/retraced';
import { findOrCreateApp, findWebhook, updateWebhook } from '@/lib/svix';
import { getTeamMember } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { NextRequest, NextResponse } from 'next/server';
import { EndpointIn } from 'svix';
import { recordMetric } from '@/lib/metrics';
import env from '@/lib/env';
import {
  getWebhookSchema,
  updateWebhookEndpointSchema,
  validateWithSchema,
} from '@/lib/zod';
import { getServerSession } from 'next-auth/next';
import { getAuthOptions } from '@/lib/nextAuth';

// Helper function to get team member for app router
async function getTeamMemberForWebhookEndpoint(slug: string) {
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

// Get a Webhook
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string; endpointId: string }> }
) {
  const params = await props.params;
  try {
    if (!env.teamFeatures.webhook) {
      throw new ApiError(404, 'Not Found');
    }

    const teamMember = await getTeamMemberForWebhookEndpoint(params.slug);
    throwIfNotAllowed(teamMember, 'team_webhook', 'read');

    const { endpointId } = validateWithSchema(getWebhookSchema, {
      endpointId: params.endpointId,
    });

    const app = await findOrCreateApp(teamMember.team.name, teamMember.team.id);

    if (!app) {
      throw new ApiError(200, 'Bad request.');
    }

    const webhook = await findWebhook(app.id, endpointId as string);

    recordMetric('webhook.fetched');

    return NextResponse.json({ data: webhook });
  } catch (err: any) {
    const message = err?.body?.detail || err.message || 'Something went wrong';
    const status = err.status || err.code || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}

// Update a Webhook
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ slug: string; endpointId: string }> }
) {
  const params = await props.params;
  try {
    if (!env.teamFeatures.webhook) {
      throw new ApiError(404, 'Not Found');
    }

    const teamMember = await getTeamMemberForWebhookEndpoint(params.slug);
    throwIfNotAllowed(teamMember, 'team_webhook', 'update');

    const body = await request.json();
    const { name, url, eventTypes, endpointId } = validateWithSchema(
      updateWebhookEndpointSchema,
      {
        ...params,
        ...body,
      }
    );

    const app = await findOrCreateApp(teamMember.team.name, teamMember.team.id);

    if (!app) {
      throw new ApiError(200, 'Bad request.');
    }

    const data: EndpointIn = {
      description: name,
      url,
      version: 1,
    };

    if (eventTypes.length > 0) {
      data['filterTypes'] = eventTypes;
    }
    // Checks if the webhook exists or throws an error
    await findWebhook(app.id, endpointId);

    const webhook = await updateWebhook(app.id, endpointId, data);

    sendAudit({
      action: 'webhook.update',
      crud: 'u',
      user: teamMember.user,
      team: teamMember.team,
    });

    recordMetric('webhook.updated');

    return NextResponse.json({ data: webhook });
  } catch (err: any) {
    const message = err?.body?.detail || err.message || 'Something went wrong';
    const status = err.status || err.code || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
