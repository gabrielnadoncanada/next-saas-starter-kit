import env from '@/lib/env';
import jackson from '@/lib/jackson';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  if (!env.teamFeatures.sso) {
    return NextResponse.json(
      { error: { message: 'Not Found' } },
      { status: 404 }
    );
  }

  try {
    const { oauthController } = await jackson();

    const requestParams = Object.fromEntries(request.nextUrl.searchParams);

    const { redirect_url, authorize_form } = await oauthController.authorize(
      requestParams as any
    );

    if (redirect_url) {
      return NextResponse.redirect(redirect_url);
    } else {
      return new NextResponse(authorize_form, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }
  } catch (err: any) {
    const message = err.message || 'Something went wrong';
    const status = err.status || 500;
    return NextResponse.json({ error: { message } }, { status });
  }
}

export async function POST(request: NextRequest) {
  if (!env.teamFeatures.sso) {
    return NextResponse.json(
      { error: { message: 'Not Found' } },
      { status: 404 }
    );
  }

  try {
    const { oauthController } = await jackson();

    const requestParams = await request.json();

    const { redirect_url, authorize_form } = await oauthController.authorize(
      requestParams as any
    );

    if (redirect_url) {
      return NextResponse.redirect(redirect_url);
    } else {
      return new NextResponse(authorize_form, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }
  } catch (err: any) {
    const message = err.message || 'Something went wrong';
    const status = err.status || 500;
    return NextResponse.json({ error: { message } }, { status });
  }
}
