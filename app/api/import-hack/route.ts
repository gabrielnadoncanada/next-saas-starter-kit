// Leave the openid-client import to get nextjs to leave the library in node_modules after build
import * as dummy from 'openid-client';
import * as jose from 'jose';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const unused = dummy; // eslint-disable-line @typescript-eslint/no-unused-vars
  const unused2 = jose; // eslint-disable-line @typescript-eslint/no-unused-vars
  return NextResponse.json({});
}
