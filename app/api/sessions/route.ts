import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';
import { sessionTokenCookieName } from '@/lib/nextAuth';
import { findManySessions } from '@/shared/model/session';

export async function GET(request: NextRequest) {
  try {
    // For App Router, we need to adapt session handling
    const session = await getSession(request as any, {} as any);
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(sessionTokenCookieName)?.value;

    let sessions = await findManySessions({
      where: {
        userId: session?.user.id,
      },
    });

    sessions.map(
      (session) =>
        (session['isCurrent'] = session.sessionToken === sessionToken)
    );

    // Sort sessions by most recent
    sessions = sessions.sort(
      (a, b) => Number(new Date(b.expires)) - Number(new Date(a.expires))
    );

    return NextResponse.json({ data: sessions });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
