'use server';

import { getCurrentUser } from '@/lib/data-fetchers';
import { getTeamMember } from '@/features/team/shared/model/team';
import { getInvitations } from '@/features/invitation/shared/model/invitation';
import { throwIfNotAllowed } from '@/shared/model/user';

export async function getInvitationsAction(
  teamSlug: string,
  sentViaEmail: boolean = true
) {
  try {
    const user = await getCurrentUser();
    const teamMember = await getTeamMember(user.id, teamSlug);

    // Check if user has permission to view invitations
    throwIfNotAllowed(teamMember, 'team_invitation', 'read');

    const invitations = await getInvitations(teamMember.teamId, sentViaEmail);

    return {
      success: true,
      data: invitations,
    };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to fetch invitations',
    };
  }
}
