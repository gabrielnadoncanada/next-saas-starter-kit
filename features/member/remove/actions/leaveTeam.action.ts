'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { removeTeamMember, getTeamMember } from '@/models/team';
import { getCurrentUser } from '@/lib/data-fetchers';

export async function leaveTeamAction(teamSlug: string) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    // Get current user's team membership
    const membership = await getTeamMember(currentUser.id, teamSlug);

    if (!membership) {
      return { error: 'You are not a member of this team' };
    }

    // Remove the current user from the team
    await removeTeamMember(membership.teamId, currentUser.id);

    // Revalidate related paths
    revalidatePath('/teams');
    revalidatePath(`/teams/${teamSlug}`);

    return { success: true };
  } catch (error) {
    console.error('Leave team error:', error);
    return {
      error: 'Failed to leave team. Please try again.',
    };
  }
}
