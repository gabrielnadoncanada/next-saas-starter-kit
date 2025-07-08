import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import packageInfo from '../../../package.json';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      version: packageInfo.version,
    });
  } catch (err: any) {
    const { statusCode = 503 } = err;
    return NextResponse.json({}, { status: statusCode });
  }
}
