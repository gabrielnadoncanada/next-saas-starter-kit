'use server';

import { redirect } from 'next/navigation';
import { hashPassword } from '@/lib/auth-utils';
import { unlockAccount } from '@/lib/accountLock';
import env from '@/lib/env';
import { updateUser } from '@/shared/model/user';
import {
  deletePasswordReset,
  getPasswordReset,
} from '@/features/auth/shared/model/passwordReset';
import { deleteManySessions } from '@/shared/model/session';
import { resetPasswordSchema } from '@/lib/zod';

export async function resetPasswordAction(token: string, formData: FormData) {
  try {
    const password = formData.get('password') as string;

    // Validate input
    resetPasswordSchema.parse({ token, password });

    if (!token) {
      throw new Error('Password reset token is required');
    }

    // Get password reset record
    const passwordReset = await getPasswordReset(token);

    if (!passwordReset) {
      throw new Error(
        'Invalid password reset token. Please request a new one.'
      );
    }

    if (passwordReset.expiresAt < new Date()) {
      throw new Error(
        'Password reset token has expired. Please request a new one.'
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    const updatedUser = await updateUser({
      where: { email: passwordReset.email },
      data: {
        password: hashedPassword,
      },
    });

    if (!updatedUser) {
      throw new Error('Error updating password. Please try again.');
    }

    // Unlock account if it was locked
    await unlockAccount(updatedUser);

    // Remove all active sessions for the user
    if (env.nextAuth.sessionStrategy === 'database') {
      await deleteManySessions({
        where: { userId: updatedUser.id },
      });
    }

    // Delete the password reset token
    await deletePasswordReset(token);

    redirect('/auth/login');
  } catch (error: any) {
    return {
      error: error.message || 'Failed to reset password',
    };
  }
}
