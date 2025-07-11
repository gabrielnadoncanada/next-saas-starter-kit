'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/data-fetchers';
import { updatePasswordSchema } from '@/features/account/shared/schema/account.schema';
import { hashPassword, verifyPassword } from '@/lib/auth-utils';
import { findFirstUserOrThrow, updateUser } from '@/shared/model/user';
import { deleteManySessions } from '@/shared/model/session';
import { cookies } from 'next/headers';
import { sessionTokenCookieName } from '@/lib/nextAuth';
import env from '@/lib/env';

export async function updatePasswordAction(formData: FormData) {
  try {
    const user = await getCurrentUser();

    const rawData = {
      currentPassword: formData.get('currentPassword') as string,
      newPassword: formData.get('newPassword') as string,
    };

    const validatedData = updatePasswordSchema.parse(rawData);

    // Get the full user data to verify current password
    const fullUser = await findFirstUserOrThrow({
      where: { id: user.id },
    });

    // Verify current password
    if (
      !(await verifyPassword(
        validatedData.currentPassword,
        fullUser.password as string
      ))
    ) {
      throw new Error('Your current password is incorrect');
    }

    // Update password
    await updateUser({
      where: { id: user.id },
      data: { password: await hashPassword(validatedData.newPassword) },
    });

    // Remove all sessions other than the current one
    if (env.nextAuth.sessionStrategy === 'database') {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get(sessionTokenCookieName)?.value;

      await deleteManySessions({
        where: {
          userId: user.id,
          NOT: {
            sessionToken,
          },
        },
      });
    }

    revalidatePath('/settings/security');

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to update password',
    };
  }
}
