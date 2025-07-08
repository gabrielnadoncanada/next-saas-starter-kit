import { NextRequest, NextResponse } from 'next/server';
import type { DirectorySyncRequest } from '@boxyhq/saml-jackson';

import env from '@/lib/env';
import jackson from '@/lib/jackson';
// import { extractAuthToken } from '@/lib/server-common';
import { handleEvents } from '@/lib/jackson/dsyncEvents';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ directory: string[] }> }
) {
  return handleSCIMRequest(request, await params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ directory: string[] }> }
) {
  return handleSCIMRequest(request, await params, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ directory: string[] }> }
) {
  return handleSCIMRequest(request, await params, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ directory: string[] }> }
) {
  return handleSCIMRequest(request, await params, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ directory: string[] }> }
) {
  return handleSCIMRequest(request, await params, 'DELETE');
}

async function handleSCIMRequest(
  request: NextRequest,
  params: { directory: string[] },
  method: string
) {
  if (!env.teamFeatures.dsync) {
    return NextResponse.json(
      { error: { message: 'Not Found' } },
      { status: 404 }
    );
  }

  const { directorySync } = await jackson();

  const { directory } = params;
  const [directoryId, path, resourceId] = directory;

  let body;
  try {
    body = await request.json();
  } catch {
    body = undefined;
  }

  // Handle the SCIM API requests
  const scimRequest: DirectorySyncRequest = {
    method: method,
    body: body,
    directoryId,
    resourceId,
    resourceType: path === 'Users' ? 'users' : 'groups',
    apiSecret: request.headers.get('authorization')?.split(' ')[1] || null,
    query: {
      count: request.nextUrl.searchParams.get('count')
        ? parseInt(request.nextUrl.searchParams.get('count')!)
        : undefined,
      startIndex: request.nextUrl.searchParams.get('startIndex')
        ? parseInt(request.nextUrl.searchParams.get('startIndex')!)
        : undefined,
      filter: request.nextUrl.searchParams.get('filter') || undefined,
    },
  };

  const { status, data } = await directorySync.requests.handle(
    scimRequest,
    handleEvents
  );

  return NextResponse.json(data, { status });
}
