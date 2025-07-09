'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/data-fetchers';
import { getTeam } from 'models/team';
import { Role } from '@prisma/client';
import { validateMembershipOperation } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';

export async function updateMemberRoleAction(
  teamSlug: string,
  memberId: string,
  newRole: Role
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const team = await getTeam({ slug: teamSlug });

    // Get current user's team member info for permission check
    const currentUserMember = await prisma.teamMember.findUniqueOrThrow({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId: user.id,
        },
      },
      include: {
        team: true,
      },
    });

    // Validate the operation
    await validateMembershipOperation(memberId, currentUserMember, {
      role: newRole,
    });

    // Update the member's role
    await prisma.teamMember.update({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId: memberId,
        },
      },
      data: {
        role: newRole,
      },
    });

    revalidatePath(`/teams/${teamSlug}/members`);

    return { success: true };
  } catch (error: any) {
    console.error('Update member role error:', error);
    return {
      error: error.message || 'Failed to update member role',
    };
  }
}
