'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/data-fetchers';
import { updateEmailSchema } from '@/features/account/shared/schema/account.schema';
import { defaultHeaders } from '@/lib/common';

export async function updateEmailAction(formData: FormData) {
  try {
    const user = await getCurrentUser();

    const rawData = {
      email: formData.get('email') as string,
    };

    const validatedData = updateEmailSchema.parse(rawData);

    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/users`, {
      method: 'PUT',
      headers: {
        ...defaultHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to update email');
    }

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
