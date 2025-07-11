'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/data-fetchers';
import { updateEmailSchema } from '@/features/account/shared/schema/account.schema';
import { updateUser } from '@/shared/model/user';
import { getUser } from '@/shared/model/user';
import { isEmailAllowed } from '@/lib/email/utils';
import env from '@/lib/env';

export async function updateEmailAction(formData: FormData) {
  try {
    const user = await getCurrentUser();

    const rawData = {
      email: formData.get('email') as string,
    };

    const validatedData = updateEmailSchema.parse(rawData);

    // Check if email change is allowed
    const allowEmailChange = env.confirmEmail === false;
    if (!allowEmailChange) {
      throw new Error('Email change is not allowed.');
    }

    // Check if email is allowed (work email validation)
    if (!isEmailAllowed(validatedData.email)) {
      throw new Error('Please use your work email.');
    }

    // Check if email is already in use
    const existingUser = await getUser({ email: validatedData.email });
    if (existingUser && existingUser.id !== user.id) {
      throw new Error('Email already in use.');
    }

    await updateUser({
      where: { id: user.id },
      data: validatedData,
    });

    revalidatePath('/settings/account');

    return {
      success: true,
      data: validatedData,
    };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to update email',
    };
  }
}
