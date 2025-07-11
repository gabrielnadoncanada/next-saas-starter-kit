import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const team = await prisma.team.findFirst({
      where: {
        slug: params.slug,
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: { message: 'Team not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: team });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
