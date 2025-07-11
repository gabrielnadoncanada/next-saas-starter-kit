'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/data-fetchers';
import { getTeam } from '@/features/team/shared/model/team';
import {
  deleteInvitation,
  getInvitation,
} from '@/features/invitation/shared/model/invitation';
import { throwIfNotAllowed } from '@/shared/model/user';
import { getTeamMember } from '@/features/team/shared/model/team';

export async function deleteInvitationAction(
  teamSlug: string,
  invitationId: string
) {
  try {
    const user = await getCurrentUser();
    const team = await getTeam({ slug: teamSlug });

    // Check if user has permission to delete invitations
    const currentUserMember = await getTeamMember(user.id, teamSlug);
    throwIfNotAllowed(currentUserMember, 'team_invitation', 'delete');

    // Verify the invitation exists and belongs to the team
    const invitation = await getInvitation({ id: invitationId });

    if (invitation.teamId !== team.id) {
      throw new Error('Invitation not found or access denied');
    }

    // Delete the invitation
    await deleteInvitation({ id: invitationId });

    revalidatePath(`/teams/${teamSlug}/members`);

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to delete invitation',
    };
  }
}
