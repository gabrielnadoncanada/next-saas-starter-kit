import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import { handleEvents } from '@/lib/jackson/dsyncEvents';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const bodyJson = JSON.parse(body);

    if (!verifyWebhookSignature(request, body)) {
      console.error('Signature verification failed.');
      return new NextResponse(null, { status: 200 });
    }

    await handleEvents(bodyJson);

    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return new NextResponse(null, { status: 200 });
  }
}

const verifyWebhookSignature = (request: NextRequest, body: string) => {
  const signatureHeader = request.headers.get('boxyhq-signature');

  if (!signatureHeader) {
    return false;
  }

  const [t, s] = signatureHeader.split(',');
  const timestamp = parseInt(t.split('=')[1]);
  const signature = s.split('=')[1];

  const expectedSignature = crypto
    .createHmac('sha256', env.jackson.dsync.webhook_secret as string)
    .update(`${timestamp}.${body}`)
    .digest('hex');

  return signature === expectedSignature;
};
