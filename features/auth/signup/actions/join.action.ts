'use server';

import { redirect } from 'next/navigation';
import { defaultHeaders } from '@/lib/common';

interface JoinActionData {
  name: string;
  email: string;
  password: string;
  team: string;
  recaptchaToken: string;
}

export async function joinAction(formData: FormData) {
  try {
    const data: JoinActionData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      team: formData.get('team') as string,
      recaptchaToken: formData.get('recaptchaToken') as string,
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

    const result = await response.json();

    if (result.data.confirmEmail) {
      redirect('/auth/verify-email');
    } else {
      redirect('/auth/login');
    }
  } catch (error: any) {
    return {
      error: error.message || 'Failed to create account',
    };
  }
}
