'use server';

import { signIn } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { loginSchema, type LoginFormData } from '../schema/login.schema';
import env from '@/lib/env';

export async function loginUserAction(formData: LoginFormData, token?: string) {
  // Validate input
  const validatedFields = loginSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      error: 'Invalid form data',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  const redirectUrl = token
    ? `/invitations/${token}`
    : env.redirectIfAuthenticated;

  try {
    const response = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: redirectUrl,
    });

    if (response && !response.ok) {
      return {
        error: response.error || 'Authentication failed',
      };
    }

    // Redirect on success
    redirect(redirectUrl);
  } catch (error) {
    return {
      error: 'An unexpected error occurred',
    };
  }
}
