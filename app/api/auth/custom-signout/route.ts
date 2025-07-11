import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';
import { sessionTokenCookieName } from '@/lib/nextAuth';
import { deleteSession } from '@/shared/model/session';
import env from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    // Get the current session using App Router approach
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // If using database sessions, delete the current session
    if (env.nextAuth.sessionStrategy === 'database') {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get(sessionTokenCookieName)?.value;

      if (sessionToken) {
        await deleteSession({
          where: {
            sessionToken,
          },
        });
      }
    }

    // Clear the session cookie
    const cookieStore = await cookies();
    cookieStore.delete(sessionTokenCookieName);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Custom signout error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
