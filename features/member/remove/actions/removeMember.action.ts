'use server';

import { revalidatePath } from 'next/cache';
import { removeMemberSchema } from '../schema/removeMember.schema';
import { removeTeamMember, getTeamMember } from '@/models/team';
import { getCurrentUser } from '@/lib/data-fetchers';
import { validateMembershipOperation } from '@/lib/rbac';

export async function removeMemberAction(teamSlug: string, userId: string) {
  try {
    const currentUser = await getCurrentUser();

    // Validate input
    const validatedFields = removeMemberSchema.safeParse({
      teamSlug,
      userId,
    });

    if (!validatedFields.success) {
      return {
        error: 'Invalid form data',
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // Get current user's team membership to validate permissions
    const currentUserMembership = await getTeamMember(currentUser.id, teamSlug);

    if (!currentUserMembership) {
      return { error: 'You are not a member of this team' };
    }

    // Validate that user can perform this operation
    try {
      await validateMembershipOperation(userId, currentUserMembership);
    } catch (error) {
      return { error: 'You do not have permission to remove this member' };
    }

    // Prevent self-removal
    if (currentUser.id === userId) {
      return { error: 'You cannot remove yourself from the team' };
    }

    // Get the member to be removed
    const memberToRemove = await getTeamMember(userId, teamSlug);

    if (!memberToRemove) {
      return { error: 'Member not found' };
    }

    // Remove the team member
    await removeTeamMember(memberToRemove.teamId, userId);

    // Revalidate related paths
    revalidatePath(`/teams/${teamSlug}/members`);
    revalidatePath(`/teams/${teamSlug}`);

    return { success: true };
  } catch (error) {
    console.error('Remove member error:', error);
    return {
      error: 'Failed to remove member. Please try again.',
    };
  }
}
