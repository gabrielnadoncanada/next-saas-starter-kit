'use server';

import { redirect } from 'next/navigation';
import { defaultHeaders } from '@/lib/common';

export async function resetPasswordAction(token: string, formData: FormData) {
  try {
    const password = formData.get('password') as string;

    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/auth/reset-password`,
      {
        method: 'POST',
        headers: {
          ...defaultHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          token,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to reset password');
    }

    redirect('/auth/login');
  } catch (error: any) {
    return {
      error: error.message || 'Failed to reset password',
    };
  }
}
