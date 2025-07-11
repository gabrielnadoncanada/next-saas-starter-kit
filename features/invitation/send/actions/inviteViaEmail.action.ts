'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/data-fetchers';
import { getTeam } from '@/features/team/shared/model/team';
import { inviteViaEmailSchema } from '@/features/invitation/shared/schema/invitation.schema';
import { createInvitation } from '@/features/invitation/shared/model/invitation';
import { sendTeamInviteEmail } from '@/lib/email/sendTeamInviteEmail';
import { throwIfNotAllowed } from '@/shared/model/user';
import { getTeamMember } from '@/features/team/shared/model/team';
import { Role } from '@prisma/client';

export async function inviteViaEmailAction(
  teamSlug: string,
  formData: FormData
) {
  try {
    const user = await getCurrentUser();
    const team = await getTeam({ slug: teamSlug });

    // Check if user has permission to invite members
    const currentUserMember = await getTeamMember(user.id, teamSlug);
    throwIfNotAllowed(currentUserMember, 'team_invitation', 'create');

    const rawData = {
      email: formData.get('email') as string,
      role: formData.get('role') as string,
    };

    const validatedData = inviteViaEmailSchema.parse(rawData);

    // Create the invitation
    const invitation = await createInvitation({
      teamId: team.id,
      email: validatedData.email,
      role: validatedData.role as Role,
      sentViaEmail: true,
      allowedDomains: [],
      invitedBy: user.id,
    });

    // Send invitation email
    await sendTeamInviteEmail(team, invitation);

    revalidatePath(`/teams/${teamSlug}/members`);

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to send invitation',
    };
  }
}
