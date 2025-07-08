import jackson from '@/lib/jackson';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { oauthController } = await jackson();

    const { RelayState, SAMLResponse } = await request.json();

    const { redirect_url } = await oauthController.samlResponse({
      RelayState,
      SAMLResponse,
    });

    if (!redirect_url) {
      throw new Error('No redirect URL found.');
    }

    return NextResponse.redirect(redirect_url);
  } catch (err: any) {
    const message = err.message || 'Something went wrong';
    const status = err.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
