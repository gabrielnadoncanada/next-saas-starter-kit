import jackson, { OIDCAuthzResponsePayload } from '@/lib/jackson';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { oauthController } = await jackson();

    const queryParams = Object.fromEntries(request.nextUrl.searchParams);

    const { redirect_url } = await oauthController.oidcAuthzResponse(
      queryParams as unknown as OIDCAuthzResponsePayload
    );

    if (redirect_url) {
      return NextResponse.redirect(redirect_url);
    }

    return NextResponse.json(
      { error: { message: 'No redirect URL found' } },
      { status: 400 }
    );
  } catch (err: any) {
    const message = err.message || 'Something went wrong';
    const status = err.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
