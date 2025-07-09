'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/data-fetchers';
import { updatePasswordSchema } from '@/features/account/shared/schema/account.schema';
import { defaultHeaders } from '@/lib/common';

export async function updatePasswordAction(formData: FormData) {
  try {
    const user = await getCurrentUser();

    const rawData = {
      currentPassword: formData.get('currentPassword') as string,
      newPassword: formData.get('newPassword') as string,
    };

    const validatedData = updatePasswordSchema.parse(rawData);

    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/password`, {
      method: 'PUT',
      headers: {
        ...defaultHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to update password');
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
