'use server';

import { redirect } from 'next/navigation';
import { acceptInvitationSchema } from '@/features/invitation/shared/schema/invitation.schema';
import { defaultHeaders } from '@/lib/common';

export async function acceptInvitationAction(
  token: string,
  formData: FormData
) {
  try {
    const rawData = {
      token,
      name: formData.get('name') as string,
      password: formData.get('password') as string,
    };

    const validatedData = acceptInvitationSchema.parse(rawData);

    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/invitations/${token}`,
      {
        method: 'PUT',
        headers: {
          ...defaultHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: validatedData.name,
          password: validatedData.password,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to accept invitation');
    }

    const result = await response.json();

    // Redirect to the team after successful acceptance
    if (result.data?.team?.slug) {
      redirect(`/teams/${result.data.team.slug}`);
    } else {
      redirect('/teams');
    }
  } catch (error: any) {
    return {
      error: error.message || 'Failed to accept invitation',
    };
  }
}
