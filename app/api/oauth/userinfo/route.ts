import { ApiError } from '@/lib/errors';
import jackson from '@/lib/jackson';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { oauthController } = await jackson();

    let token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      const accessToken = request.nextUrl.searchParams.get('access_token');
      if (accessToken) {
        token = accessToken;
      }
    }

    if (!token) {
      throw new ApiError(401, 'Unauthorized');
    }

    const profile = await oauthController.userInfo(token);

    return NextResponse.json(profile);
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
