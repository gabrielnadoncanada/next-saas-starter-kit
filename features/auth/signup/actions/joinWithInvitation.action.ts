'use server';

import { redirect } from 'next/navigation';
import { defaultHeaders } from '@/lib/common';

interface JoinWithInvitationData {
  name: string;
  email?: string;
  password: string;
  sentViaEmail: boolean;
  recaptchaToken: string;
  inviteToken: string;
}

export async function joinWithInvitationAction(
  inviteToken: string,
  formData: FormData
) {
  try {
    const data: JoinWithInvitationData = {
      name: formData.get('name') as string,
      email: (formData.get('email') as string) || undefined,
      password: formData.get('password') as string,
      sentViaEmail: formData.get('sentViaEmail') === 'true',
      recaptchaToken: formData.get('recaptchaToken') as string,
      inviteToken,
    };

    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/join`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create account');
    }

    redirect(`/auth/login?token=${inviteToken}`);
  } catch (error: any) {
    return {
      error: error.message || 'Failed to create account',
    };
  }
}
