'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/data-fetchers';
import { getTeam, deleteTeam } from 'models/team';

export async function deleteTeamAction(teamSlug: string) {
  try {
    const user = await getCurrentUser();
    const team = await getTeam({ slug: teamSlug });

    await deleteTeam({ id: team.id });

    revalidatePath('/teams');

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to delete team',
    };
  }
}
