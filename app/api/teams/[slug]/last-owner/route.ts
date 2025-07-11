import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/data-fetchers';
import { getTeam, isLastOwnerOfTeam } from '@/features/team/shared/model/team';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const team = await getTeam({ slug: params.slug });
    const isLastOwner = await isLastOwnerOfTeam(user.id, team.id);

    return NextResponse.json({ isLastOwner });
  } catch (error) {
    console.error('Error checking last owner status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
