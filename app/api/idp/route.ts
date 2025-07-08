import jackson from '@/lib/jackson';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { directorySync } = await jackson();

  // List of directory sync providers
  return NextResponse.json({ data: directorySync.providers() });
}
