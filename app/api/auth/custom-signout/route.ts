import { getServerSession } from 'next-auth/next';
import { getAuthOptions, sessionTokenCookieName } from '@/lib/nextAuth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import env from '@/lib/env';
import { deleteSession } from 'models/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const authOptions = getAuthOptions({} as any, {} as any);
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (env.nextAuth.sessionStrategy === 'database') {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get(sessionTokenCookieName)?.value;

      if (sessionToken) {
        const sessionDBEntry = await prisma.session.findFirst({
          where: {
            sessionToken: sessionToken,
          },
        });

        if (sessionDBEntry) {
          await deleteSession({
            where: {
              sessionToken: sessionToken,
            },
          });
        }
      }
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: 'next-auth.session-token',
      value: '',
      path: '/',
      expires: new Date(0),
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 });
  }
}
