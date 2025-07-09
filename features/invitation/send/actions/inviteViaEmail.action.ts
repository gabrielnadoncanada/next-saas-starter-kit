'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/data-fetchers';
import { getTeam } from 'models/team';
import { inviteViaEmailSchema } from '@/features/invitation/shared/schema/invitation.schema';
import { defaultHeaders } from '@/lib/common';

export async function inviteViaEmailAction(
  teamSlug: string,
  formData: FormData
) {
  try {
    const user = await getCurrentUser();
    const team = await getTeam({ slug: teamSlug });

    const rawData = {
      email: formData.get('email') as string,
      role: formData.get('role') as string,
    };

    const validatedData = inviteViaEmailSchema.parse(rawData);

    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/teams/${teamSlug}/invitations`,
      {
        method: 'POST',
        headers: {
          ...defaultHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: validatedData.email,
          role: validatedData.role,
          sentViaEmail: true,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to send invitation');
    }

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
