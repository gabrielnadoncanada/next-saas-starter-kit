'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/data-fetchers';
import { updateNameSchema } from '@/features/account/shared/schema/account.schema';
import { updateUser } from '@/shared/model/user';

export async function updateNameAction(formData: FormData) {
  try {
    const user = await getCurrentUser();

    const rawData = {
      name: formData.get('name') as string,
    };

    const validatedData = updateNameSchema.parse(rawData);

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
      error: error.message || 'Failed to update name',
    };
  }
}
