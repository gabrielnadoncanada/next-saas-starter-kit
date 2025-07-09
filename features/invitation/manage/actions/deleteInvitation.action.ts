'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/data-fetchers';
import { getTeam } from 'models/team';
import { defaultHeaders } from '@/lib/common';

export async function deleteInvitationAction(
  teamSlug: string,
  invitationId: string
) {
  try {
    const user = await getCurrentUser();
    const team = await getTeam({ slug: teamSlug });

    const sp = new URLSearchParams({ id: invitationId });

    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/teams/${teamSlug}/invitations?${sp.toString()}`,
      {
        method: 'DELETE',
        headers: defaultHeaders,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to delete invitation');
    }

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
