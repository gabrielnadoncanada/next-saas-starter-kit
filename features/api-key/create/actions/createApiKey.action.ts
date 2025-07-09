'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/data-fetchers';
import { getTeam } from 'models/team';
import { createApiKey } from 'models/apiKey';
import { createApiKeySchema } from '@/lib/zod';

export async function createApiKeyAction(teamSlug: string, formData: FormData) {
  try {
    const user = await getCurrentUser();
    const team = await getTeam({ slug: teamSlug });

    const rawData = {
      name: formData.get('name') as string,
    };

    const { name } = createApiKeySchema.parse(rawData);

    const apiKey = await createApiKey({
      name,
      teamId: team.id,
    });

    revalidatePath(`/teams/${teamSlug}/api-keys`);

    return {
      success: true,
      data: apiKey, // Return the actual key for display
    };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to create API key',
    };
  }
}
