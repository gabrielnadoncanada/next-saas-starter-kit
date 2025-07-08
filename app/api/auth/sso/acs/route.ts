import { NextRequest, NextResponse } from 'next/server';

// This is a legacy endpoint that is maintained for backwards compatibility.
// The new endpoint is app/api/oauth/saml/route.ts
// We need to import the handler from the new location

export async function GET(request: NextRequest) {
  // Forward to the new SAML endpoint
  const url = new URL('/api/oauth/saml', request.url);
  url.search = request.nextUrl.search;

  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest) {
  // Forward to the new SAML endpoint
  const url = new URL('/api/oauth/saml', request.url);
  url.search = request.nextUrl.search;

  return NextResponse.redirect(url);
}
