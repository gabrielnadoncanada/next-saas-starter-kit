import jackson from '@/lib/jackson';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { oauthController } = await jackson();

    const body = await request.json();
    const token = await oauthController.token(body);

    return NextResponse.json(token);
  } catch (err: any) {
    const message = err.message || 'Something went wrong';
    const status = err.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
